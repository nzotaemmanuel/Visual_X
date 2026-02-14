import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

function csvEscape(v: any) {
    return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
    try {
        const zoneId = request.nextUrl.searchParams.get('zoneId');
        const startDate = request.nextUrl.searchParams.get('startDate');
        const endDate = request.nextUrl.searchParams.get('endDate');

        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Filter by Zone
        if (zoneId && zoneId !== 'all') {
            conditions.push(`cv.zone_id = $${paramIndex++}`);
            params.push(parseInt(zoneId));
        }

        // Filter by Date
        if (startDate) {
            conditions.push(`cv.violation_date >= $${paramIndex++}`);
            params.push(new Date(startDate));
        }
        if (endDate) {
            conditions.push(`cv.violation_date <= $${paramIndex++}`);
            params.push(new Date(endDate));
        }

        const baseWhere = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const pageSize = 1000;

        const stream = new ReadableStream({
            async start(controller) {
                // Updated header to match enforcement context
                const header = [
                    'Violation ID',
                    'Reference ID',
                    'Vehicle Plate',
                    'Zone',
                    'Violation Type',
                    'Status',
                    'Fine Amount',
                    'Officer',
                    'Date',
                    'Enforcement Actions'
                ];
                controller.enqueue(header.join(',') + '\n');

                let lastId = 0;
                while (true) {
                    const currentParams = [...params];
                    // Add cursor condition
                    const whereClause = baseWhere
                        ? `${baseWhere} AND cv.id > $${paramIndex}`
                        : `WHERE cv.id > $${paramIndex}`;

                    currentParams.push(lastId);

                    const query = `
                        SELECT 
                            cv.*,
                            v.plate_number,
                            pz.zone_name,
                            vt.description as violation_description,
                            s.first_name as officer_first_name,
                            s.last_name as officer_last_name,
                            (
                                SELECT string_agg(concat(ea.action_type, ' (', ea.status, ')'), '; ')
                                FROM enforcement_actions ea
                                WHERE ea.violation_id = cv.id
                            ) as actions_list
                        FROM customer_violations cv
                        LEFT JOIN vehicles v ON cv.vehicle_id = v.id
                        LEFT JOIN parking_zones pz ON cv.zone_id = pz.id
                        LEFT JOIN violation_types vt ON cv.violation_type_id = vt.id
                        LEFT JOIN staff s ON cv.enforcement_officer_id = s.id
                        ${whereClause}
                        ORDER BY cv.id ASC
                        LIMIT ${pageSize}
                    `;

                    const result = await db.query(query, currentParams);
                    const batch = result.rows;

                    if (batch.length === 0) break;

                    for (const v of batch) {
                        const row = [
                            csvEscape(v.id),
                            csvEscape(v.reference_id),
                            csvEscape(v.plate_number ?? 'Unknown'),
                            csvEscape(v.zone_name ?? ''),
                            csvEscape(v.violation_description ?? 'Unknown'),
                            csvEscape(v.status),
                            csvEscape(v.fee_amount ?? 0),
                            csvEscape(v.officer_first_name ? `${v.officer_first_name} ${v.officer_last_name}` : 'System'),
                            csvEscape(v.violation_date?.toISOString() ?? ''),
                            csvEscape(v.actions_list || '')
                        ];
                        controller.enqueue(row.join(',') + '\n');
                        lastId = v.id;
                    }

                    if (batch.length < pageSize) break;
                }

                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="compliance_report.csv"',
            },
        });
    } catch (error: any) {
        console.error('Error exporting compliance report:', error);
        return new Response(JSON.stringify({ error: 'Failed to export compliance report' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
