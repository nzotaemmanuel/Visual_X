import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

function csvEscape(v: any) {
    return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
    try {
        const zoneId = request.nextUrl.searchParams.get('zoneId');
        const startDate = request.nextUrl.searchParams.get('startDate');
        const endDate = request.nextUrl.searchParams.get('endDate');

        const where: any = {};

        // Filter by Zone
        if (zoneId && zoneId !== 'all') {
            where.zone = { id: parseInt(zoneId) };
        }

        // Filter by Date
        if (startDate || endDate) {
            where.violationDate = {};
            if (startDate) where.violationDate.gte = new Date(startDate);
            if (endDate) where.violationDate.lte = new Date(endDate);
        }

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

                let lastId: any = undefined;
                while (true) {
                    const query: any = {
                        where,
                        include: {
                            vehicle: true,
                            zone: true,
                            violationType: true,
                            enforcementOfficer: true,
                            actions: true // Include related actions like Clamp/Tow
                        },
                        orderBy: { id: 'asc' },
                        take: pageSize,
                    };

                    if (lastId) {
                        query.cursor = { id: lastId };
                        query.skip = 1;
                    }

                    const batch = await prisma.customerViolation.findMany(query);
                    if (batch.length === 0) break;

                    for (const v of batch as any[]) {
                        // Format actions into a single string
                        const actionsList = v.actions?.map((a: any) => `${a.actionType} (${a.status})`).join('; ') || '';

                        const row = [
                            csvEscape(v.id),
                            csvEscape(v.referenceId),
                            csvEscape(v.vehicle?.plateNumber ?? 'Unknown'),
                            csvEscape(v.zone?.zoneName ?? ''),
                            csvEscape(v.violationType?.description ?? 'Unknown'),
                            csvEscape(v.status),
                            csvEscape(v.feeAmount ?? 0),
                            csvEscape(v.enforcementOfficer ? `${v.enforcementOfficer.firstName} ${v.enforcementOfficer.lastName}` : 'System'),
                            csvEscape(v.violationDate?.toISOString() ?? ''),
                            csvEscape(actionsList)
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
