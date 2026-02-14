--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: AccountStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AccountStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED'
);


--
-- Name: ActionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ActionStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'RELEASED'
);


--
-- Name: ActionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ActionType" AS ENUM (
    'CLAMP',
    'TOW',
    'IMPOUND'
);


--
-- Name: AppealStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AppealStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'WALLET',
    'CARD',
    'CASH',
    'AIRTIME'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID'
);


--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: SlotStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SlotStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'RESERVED',
    'OUT_OF_SERVICE'
);


--
-- Name: StaffRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StaffRole" AS ENUM (
    'ADMIN',
    'PARKING_AGENT',
    'ENFORCEMENT_AGENT'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'ENFORCEMENT_OFFICER',
    'ANALYST',
    'VIEWER'
);


--
-- Name: ViolationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ViolationStatus" AS ENUM (
    'OUTSTANDING',
    'PAID',
    'APPEALED',
    'WAIVED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: appeals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appeals (
    appeal_reason text NOT NULL,
    attachments jsonb,
    status public."AppealStatus" DEFAULT 'PENDING'::public."AppealStatus" NOT NULL,
    review_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id integer NOT NULL,
    id integer NOT NULL,
    violation_id integer NOT NULL,
    reviewer_id integer
);


--
-- Name: appeals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appeals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appeals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appeals_id_seq OWNED BY public.appeals.id;


--
-- Name: customer_violations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_violations (
    reference_id text NOT NULL,
    location_description text,
    violation_date timestamp(3) without time zone NOT NULL,
    fee_amount numeric(10,2) NOT NULL,
    status public."ViolationStatus" DEFAULT 'OUTSTANDING'::public."ViolationStatus" NOT NULL,
    evidence_images jsonb,
    customer_id integer NOT NULL,
    id integer NOT NULL,
    ticket_id integer,
    vehicle_id integer NOT NULL,
    violation_type_id integer NOT NULL,
    zone_id integer NOT NULL,
    enforcement_officer_id integer NOT NULL
);


--
-- Name: customer_violations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_violations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_violations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_violations_id_seq OWNED BY public.customer_violations.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_reference_id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    account_status public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: enforcement_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enforcement_actions (
    action_type public."ActionType" NOT NULL,
    reference_id text NOT NULL,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."ActionStatus" DEFAULT 'PENDING'::public."ActionStatus" NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    release_date timestamp(3) without time zone,
    towing_company text,
    impound_lot_location text,
    id integer NOT NULL,
    violation_id integer NOT NULL,
    requested_by integer NOT NULL
);


--
-- Name: enforcement_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enforcement_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enforcement_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enforcement_actions_id_seq OWNED BY public.enforcement_actions.id;


--
-- Name: fines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fines (
    amount numeric(10,2) NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    payment_date timestamp(3) without time zone,
    id integer NOT NULL,
    violation_id integer NOT NULL
);


--
-- Name: fines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fines_id_seq OWNED BY public.fines.id;


--
-- Name: parking_bays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_bays (
    bay_code text NOT NULL,
    bay_name text NOT NULL,
    address text,
    capacity_lanes integer DEFAULT 0 NOT NULL,
    base_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    operating_hours jsonb,
    id integer NOT NULL,
    zone_id integer NOT NULL
);


--
-- Name: parking_bays_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_bays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_bays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_bays_id_seq OWNED BY public.parking_bays.id;


--
-- Name: parking_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_requests (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    zone_id integer,
    bay_id integer,
    slot_id integer,
    start_time timestamp(3) without time zone NOT NULL,
    duration_hours integer NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: parking_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_requests_id_seq OWNED BY public.parking_requests.id;


--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_slots (
    slot_number text NOT NULL,
    status public."SlotStatus" DEFAULT 'AVAILABLE'::public."SlotStatus" NOT NULL,
    sensor_id text,
    id integer NOT NULL,
    bay_id integer NOT NULL
);


--
-- Name: parking_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_slots_id_seq OWNED BY public.parking_slots.id;


--
-- Name: parking_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_tickets (
    transaction_ref text NOT NULL,
    channel text DEFAULT 'WEB'::text NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    duration_hours integer NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    expiry_time timestamp(3) without time zone NOT NULL,
    checkout_time timestamp(3) without time zone,
    status public."TicketStatus" DEFAULT 'ACTIVE'::public."TicketStatus" NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id integer NOT NULL,
    customer_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    bay_id integer NOT NULL,
    slot_id integer,
    agent_id integer
);


--
-- Name: parking_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_tickets_id_seq OWNED BY public.parking_tickets.id;


--
-- Name: parking_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_zones (
    zone_code text NOT NULL,
    zone_name text NOT NULL,
    geographical_area public.geometry(Polygon,4326),
    id integer NOT NULL
);


--
-- Name: parking_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_zones_id_seq OWNED BY public.parking_zones.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_resets (
    id text NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipts (
    receipt_number text NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pdf_url text,
    id integer NOT NULL,
    ticket_id integer NOT NULL
);


--
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.receipts_id_seq OWNED BY public.receipts.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    role public."StaffRole" NOT NULL,
    account_status public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text,
    last_name text,
    role public."UserRole" DEFAULT 'VIEWER'::public."UserRole" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_active_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    plate_number text NOT NULL,
    plate_code text,
    plate_source text,
    plate_type text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    customer_id integer NOT NULL,
    id integer NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: violation_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.violation_types (
    code text NOT NULL,
    description text NOT NULL,
    default_fee numeric(10,2) NOT NULL,
    severity_level integer DEFAULT 1 NOT NULL,
    id integer NOT NULL
);


--
-- Name: violation_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.violation_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: violation_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.violation_types_id_seq OWNED BY public.violation_types.id;


--
-- Name: appeals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals ALTER COLUMN id SET DEFAULT nextval('public.appeals_id_seq'::regclass);


--
-- Name: customer_violations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations ALTER COLUMN id SET DEFAULT nextval('public.customer_violations_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: enforcement_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_actions ALTER COLUMN id SET DEFAULT nextval('public.enforcement_actions_id_seq'::regclass);


--
-- Name: fines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fines ALTER COLUMN id SET DEFAULT nextval('public.fines_id_seq'::regclass);


--
-- Name: parking_bays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_bays ALTER COLUMN id SET DEFAULT nextval('public.parking_bays_id_seq'::regclass);


--
-- Name: parking_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests ALTER COLUMN id SET DEFAULT nextval('public.parking_requests_id_seq'::regclass);


--
-- Name: parking_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots ALTER COLUMN id SET DEFAULT nextval('public.parking_slots_id_seq'::regclass);


--
-- Name: parking_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets ALTER COLUMN id SET DEFAULT nextval('public.parking_tickets_id_seq'::regclass);


--
-- Name: parking_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_zones ALTER COLUMN id SET DEFAULT nextval('public.parking_zones_id_seq'::regclass);


--
-- Name: receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts ALTER COLUMN id SET DEFAULT nextval('public.receipts_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: violation_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.violation_types ALTER COLUMN id SET DEFAULT nextval('public.violation_types_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
17318fd6-12fd-4deb-816b-e19cf7f4622c	6d029be2957ed090e7a400bebcdc27c8f0c2a376a0861345f6c44be5faed5ece	2026-02-07 14:35:07.920988+01	20260204094350_init	\N	\N	2026-02-07 14:35:06.967267+01	1
6e1d05f8-c155-4597-8c45-d6fb02ffae85	1a1f4443b68c85e760bb26053c63ab26f4f0962903c5acbeb4ebcc38d0366d0a	2026-02-07 14:35:53.752895+01	20260207133528_split_users_into_staff_and_customers	\N	\N	2026-02-07 14:35:53.237423+01	1
d2f96808-5cb2-476a-92d5-20bcc895883b	02e6066d6740dc296ac88fb11639f390c577b6513d1ef6adb04e2990441e9e35	2026-02-07 16:57:47.344871+01	20260207155747_add_auth_system	\N	\N	2026-02-07 16:57:47.125763+01	1


--
-- Data for Name: appeals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appeals (appeal_reason, attachments, status, review_notes, created_at, customer_id, id, violation_id, reviewer_id) FROM stdin;
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 13:37:51.27	3	1	3	\N
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 13:37:51.298	2	2	8	\N
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 13:37:51.319	1	3	13	\N
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 16:15:31.734	3	4	18	\N
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 16:15:31.755	2	5	23	\N
I was only there for 2 minutes to drop off a medical delivery.	\N	PENDING	\N	2026-02-07 16:15:31.776	1	6	28	\N


--
-- Data for Name: customer_violations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_violations (reference_id, location_description, violation_date, fee_amount, status, evidence_images, customer_id, id, ticket_id, vehicle_id, violation_type_id, zone_id, enforcement_officer_id) FROM stdin;
VIO-LLS8LGWM	Near Ikeja Square	2026-02-07 13:37:51.243	25000.00	PAID	\N	1	1	\N	1	1	1	3
VIO-Q8FAPABX	Near Agege Square	2026-02-07 13:37:51.254	50000.00	OUTSTANDING	\N	2	2	\N	2	2	2	4
VIO-M0AXHD8O	Near Alimosho Square	2026-02-07 13:37:51.262	100000.00	OUTSTANDING	\N	3	3	\N	3	3	3	3
VIO-NNPPHHKW	Near Lagos Island Square	2026-02-07 13:37:51.273	25000.00	PAID	\N	1	4	\N	4	1	4	4
VIO-4J9JV5T4	Near Lagos Mainland Square	2026-02-07 13:37:51.277	50000.00	OUTSTANDING	\N	2	5	\N	5	2	5	3
VIO-WEFKW6VE	Near Mushin Square	2026-02-07 13:37:51.283	100000.00	OUTSTANDING	\N	3	6	\N	1	3	6	4
VIO-S0MVYAMP	Near Oshodi-Isolo Square	2026-02-07 13:37:51.287	25000.00	PAID	\N	1	7	\N	2	1	7	3
VIO-6TR1FO70	Near Apapa Square	2026-02-07 13:37:51.292	50000.00	OUTSTANDING	\N	2	8	\N	3	2	8	4
VIO-Z4HCJGC0	Near Surulere Square	2026-02-07 13:37:51.299	100000.00	OUTSTANDING	\N	3	9	\N	4	3	9	3
VIO-JQJQOKS4	Near Eti-Osa Square	2026-02-07 13:37:51.302	25000.00	PAID	\N	1	10	\N	5	1	10	4
VIO-UCPX6PYL	Near Victoria Island Square	2026-02-07 13:37:51.305	50000.00	OUTSTANDING	\N	2	11	\N	1	2	11	3
VIO-GEJPUUY7	Near Ikorodu Square	2026-02-07 13:37:51.308	100000.00	OUTSTANDING	\N	3	12	\N	2	3	12	4
VIO-F4WANCG4	Near Ajeromi-Ifelodun Square	2026-02-07 13:37:51.314	25000.00	PAID	\N	1	13	\N	3	1	13	3
VIO-MIP6DDM4	Near Amuwo-Odofin Square	2026-02-07 13:37:51.32	50000.00	OUTSTANDING	\N	2	14	\N	4	2	14	4
VIO-GRWUAWYN	Near Badagry Square	2026-02-07 13:37:51.322	100000.00	OUTSTANDING	\N	3	15	\N	5	3	15	3
VIO-0T5KB66S	Near Ikeja Square	2026-02-07 16:15:31.71	25000.00	PAID	\N	1	16	\N	1	1	1	3
VIO-WNYDQWGB	Near Agege Square	2026-02-07 16:15:31.719	50000.00	OUTSTANDING	\N	2	17	\N	2	2	2	4
VIO-65GGV5OY	Near Alimosho Square	2026-02-07 16:15:31.728	100000.00	OUTSTANDING	\N	3	18	\N	3	3	3	3
VIO-FXBCRRBT	Near Lagos Island Square	2026-02-07 16:15:31.738	25000.00	PAID	\N	1	19	\N	4	1	4	4
VIO-TCHCZXHZ	Near Lagos Mainland Square	2026-02-07 16:15:31.741	50000.00	OUTSTANDING	\N	2	20	\N	5	2	5	3
VIO-42Z9E36V	Near Mushin Square	2026-02-07 16:15:31.743	100000.00	OUTSTANDING	\N	3	21	\N	1	3	6	4
VIO-WW9D3F4O	Near Oshodi-Isolo Square	2026-02-07 16:15:31.745	25000.00	PAID	\N	1	22	\N	2	1	7	3
VIO-6FA7UDOY	Near Apapa Square	2026-02-07 16:15:31.748	50000.00	OUTSTANDING	\N	2	23	\N	3	2	8	4
VIO-MOBQ4IZP	Near Surulere Square	2026-02-07 16:15:31.756	100000.00	OUTSTANDING	\N	3	24	\N	4	3	9	3
VIO-VTFQSZ4E	Near Eti-Osa Square	2026-02-07 16:15:31.759	25000.00	PAID	\N	1	25	\N	5	1	10	4
VIO-1CJ1ZTSM	Near Victoria Island Square	2026-02-07 16:15:31.763	50000.00	OUTSTANDING	\N	2	26	\N	1	2	11	3
VIO-71NUR7SR	Near Ikorodu Square	2026-02-07 16:15:31.766	100000.00	OUTSTANDING	\N	3	27	\N	2	3	12	4
VIO-PT7DJYQU	Near Ajeromi-Ifelodun Square	2026-02-07 16:15:31.773	25000.00	PAID	\N	1	28	\N	3	1	13	3
VIO-IZK5ZBT3	Near Amuwo-Odofin Square	2026-02-07 16:15:31.777	50000.00	OUTSTANDING	\N	2	29	\N	4	2	14	4
VIO-BQQCE9SE	Near Badagry Square	2026-02-07 16:15:31.78	100000.00	OUTSTANDING	\N	3	30	\N	5	3	15	3


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, customer_reference_id, first_name, last_name, email, phone_number, account_status, created_at, updated_at) FROM stdin;
1	CUST-57BSH4	John	Doe	john.doe@gmail.com	+2347023862097	ACTIVE	2026-02-07 13:37:50.48	2026-02-07 13:37:50.48
2	CUST-7JH4PZ	Jane	Smith	jane.smith@yahoo.com	+2347048662212	ACTIVE	2026-02-07 13:37:50.488	2026-02-07 13:37:50.488
3	CUST-YBOYPR	Tunde	Bakare	tunde.bakare@outlook.com	+2347063270761	ACTIVE	2026-02-07 13:37:50.493	2026-02-07 13:37:50.493


--
-- Data for Name: enforcement_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enforcement_actions (action_type, reference_id, requested_at, status, payment_status, release_date, towing_company, impound_lot_location, id, violation_id, requested_by) FROM stdin;
CLAMP	ACT-Q8FAPABX	2026-02-07 13:37:51.258	COMPLETED	PENDING	\N	\N	\N	1	2	4
CLAMP	ACT-S0MVYAMP	2026-02-07 13:37:51.292	COMPLETED	PENDING	\N	\N	\N	2	7	3
CLAMP	ACT-GEJPUUY7	2026-02-07 13:37:51.311	COMPLETED	PENDING	\N	\N	\N	3	12	4
CLAMP	ACT-WNYDQWGB	2026-02-07 16:15:31.725	COMPLETED	PENDING	\N	\N	\N	4	17	4
CLAMP	ACT-WW9D3F4O	2026-02-07 16:15:31.747	COMPLETED	PENDING	\N	\N	\N	5	22	3
CLAMP	ACT-71NUR7SR	2026-02-07 16:15:31.772	COMPLETED	PENDING	\N	\N	\N	6	27	4


--
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fines (amount, is_paid, payment_date, id, violation_id) FROM stdin;
25000.00	t	2026-02-07 13:37:51.251	1	1
50000.00	f	\N	2	2
100000.00	f	\N	3	3
25000.00	t	2026-02-07 13:37:51.275	4	4
50000.00	f	\N	5	5
100000.00	f	\N	6	6
25000.00	t	2026-02-07 13:37:51.29	7	7
50000.00	f	\N	8	8
100000.00	f	\N	9	9
25000.00	t	2026-02-07 13:37:51.304	10	10
50000.00	f	\N	11	11
100000.00	f	\N	12	12
25000.00	t	2026-02-07 13:37:51.316	13	13
50000.00	f	\N	14	14
100000.00	f	\N	15	15
25000.00	t	2026-02-07 16:15:31.714	16	16
50000.00	f	\N	17	17
100000.00	f	\N	18	18
25000.00	t	2026-02-07 16:15:31.74	19	19
50000.00	f	\N	20	20
100000.00	f	\N	21	21
25000.00	t	2026-02-07 16:15:31.746	22	22
50000.00	f	\N	23	23
100000.00	f	\N	24	24
25000.00	t	2026-02-07 16:15:31.761	25	25
50000.00	f	\N	26	26
100000.00	f	\N	27	27
25000.00	t	2026-02-07 16:15:31.775	28	28
50000.00	f	\N	29	29
100000.00	f	\N	30	30


--
-- Data for Name: parking_bays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_bays (bay_code, bay_name, address, capacity_lanes, base_fee, operating_hours, id, zone_id) FROM stdin;
IKJ111-BAY-01	Ikeja Main Street 1	10 Obafemi Awolowo Way, Ikeja	5	200.00	{"open": "08:00", "close": "20:00"}	1	1
IKJ111-BAY-02	Ikeja Main Street 2	20 Obafemi Awolowo Way, Ikeja	5	200.00	{"open": "08:00", "close": "20:00"}	2	1
AGE112-BAY-01	Agege Main Street 1	10 Obafemi Awolowo Way, Agege	5	200.00	{"open": "08:00", "close": "20:00"}	3	2
AGE112-BAY-02	Agege Main Street 2	20 Obafemi Awolowo Way, Agege	5	200.00	{"open": "08:00", "close": "20:00"}	4	2
ALI113-BAY-01	Alimosho Main Street 1	10 Obafemi Awolowo Way, Alimosho	5	200.00	{"open": "08:00", "close": "20:00"}	5	3
ALI113-BAY-02	Alimosho Main Street 2	20 Obafemi Awolowo Way, Alimosho	5	200.00	{"open": "08:00", "close": "20:00"}	6	3
LAS114-BAY-01	Lagos Island Main Street 1	10 Obafemi Awolowo Way, Lagos Island	5	200.00	{"open": "08:00", "close": "20:00"}	7	4
LAS114-BAY-02	Lagos Island Main Street 2	20 Obafemi Awolowo Way, Lagos Island	5	200.00	{"open": "08:00", "close": "20:00"}	8	4
LMN115-BAY-01	Lagos Mainland Main Street 1	10 Obafemi Awolowo Way, Lagos Mainland	5	200.00	{"open": "08:00", "close": "20:00"}	9	5
LMN115-BAY-02	Lagos Mainland Main Street 2	20 Obafemi Awolowo Way, Lagos Mainland	5	200.00	{"open": "08:00", "close": "20:00"}	10	5
MSN116-BAY-01	Mushin Main Street 1	10 Obafemi Awolowo Way, Mushin	5	200.00	{"open": "08:00", "close": "20:00"}	11	6
MSN116-BAY-02	Mushin Main Street 2	20 Obafemi Awolowo Way, Mushin	5	200.00	{"open": "08:00", "close": "20:00"}	12	6
OSS118-BAY-01	Oshodi-Isolo Main Street 1	10 Obafemi Awolowo Way, Oshodi-Isolo	5	200.00	{"open": "08:00", "close": "20:00"}	13	7
OSS118-BAY-02	Oshodi-Isolo Main Street 2	20 Obafemi Awolowo Way, Oshodi-Isolo	5	200.00	{"open": "08:00", "close": "20:00"}	14	7
APA119-BAY-01	Apapa Main Street 1	10 Obafemi Awolowo Way, Apapa	5	200.00	{"open": "08:00", "close": "20:00"}	15	8
APA119-BAY-02	Apapa Main Street 2	20 Obafemi Awolowo Way, Apapa	5	200.00	{"open": "08:00", "close": "20:00"}	16	8
SUR120-BAY-01	Surulere Main Street 1	10 Obafemi Awolowo Way, Surulere	5	200.00	{"open": "08:00", "close": "20:00"}	17	9
SUR120-BAY-02	Surulere Main Street 2	20 Obafemi Awolowo Way, Surulere	5	200.00	{"open": "08:00", "close": "20:00"}	18	9
EOS121-BAY-01	Eti-Osa Main Street 1	10 Obafemi Awolowo Way, Eti-Osa	5	200.00	{"open": "08:00", "close": "20:00"}	19	10
EOS121-BAY-02	Eti-Osa Main Street 2	20 Obafemi Awolowo Way, Eti-Osa	5	200.00	{"open": "08:00", "close": "20:00"}	20	10
VIB122-BAY-01	Victoria Island Main Street 1	10 Obafemi Awolowo Way, Victoria Island	5	200.00	{"open": "08:00", "close": "20:00"}	21	11
VIB122-BAY-02	Victoria Island Main Street 2	20 Obafemi Awolowo Way, Victoria Island	5	200.00	{"open": "08:00", "close": "20:00"}	22	11
IKD112-BAY-01	Ikorodu Main Street 1	10 Obafemi Awolowo Way, Ikorodu	5	200.00	{"open": "08:00", "close": "20:00"}	23	12
IKD112-BAY-02	Ikorodu Main Street 2	20 Obafemi Awolowo Way, Ikorodu	5	200.00	{"open": "08:00", "close": "20:00"}	24	12
AJI123-BAY-01	Ajeromi-Ifelodun Main Street 1	10 Obafemi Awolowo Way, Ajeromi-Ifelodun	5	200.00	{"open": "08:00", "close": "20:00"}	25	13
AJI123-BAY-02	Ajeromi-Ifelodun Main Street 2	20 Obafemi Awolowo Way, Ajeromi-Ifelodun	5	200.00	{"open": "08:00", "close": "20:00"}	26	13
AMO124-BAY-01	Amuwo-Odofin Main Street 1	10 Obafemi Awolowo Way, Amuwo-Odofin	5	200.00	{"open": "08:00", "close": "20:00"}	27	14
AMO124-BAY-02	Amuwo-Odofin Main Street 2	20 Obafemi Awolowo Way, Amuwo-Odofin	5	200.00	{"open": "08:00", "close": "20:00"}	28	14
BAD125-BAY-01	Badagry Main Street 1	10 Obafemi Awolowo Way, Badagry	5	200.00	{"open": "08:00", "close": "20:00"}	29	15
BAD125-BAY-02	Badagry Main Street 2	20 Obafemi Awolowo Way, Badagry	5	200.00	{"open": "08:00", "close": "20:00"}	30	15
EPE126-BAY-01	Epe Main Street 1	10 Obafemi Awolowo Way, Epe	5	200.00	{"open": "08:00", "close": "20:00"}	31	16
EPE126-BAY-02	Epe Main Street 2	20 Obafemi Awolowo Way, Epe	5	200.00	{"open": "08:00", "close": "20:00"}	32	16
IBL127-BAY-01	Ibeju-Lekki Main Street 1	10 Obafemi Awolowo Way, Ibeju-Lekki	5	200.00	{"open": "08:00", "close": "20:00"}	33	17
IBL127-BAY-02	Ibeju-Lekki Main Street 2	20 Obafemi Awolowo Way, Ibeju-Lekki	5	200.00	{"open": "08:00", "close": "20:00"}	34	17
IFA128-BAY-01	Ifako-Ijaiye Main Street 1	10 Obafemi Awolowo Way, Ifako-Ijaiye	5	200.00	{"open": "08:00", "close": "20:00"}	35	18
IFA128-BAY-02	Ifako-Ijaiye Main Street 2	20 Obafemi Awolowo Way, Ifako-Ijaiye	5	200.00	{"open": "08:00", "close": "20:00"}	36	18
KOS129-BAY-01	Kosofe Main Street 1	10 Obafemi Awolowo Way, Kosofe	5	200.00	{"open": "08:00", "close": "20:00"}	37	19
KOS129-BAY-02	Kosofe Main Street 2	20 Obafemi Awolowo Way, Kosofe	5	200.00	{"open": "08:00", "close": "20:00"}	38	19
OJO130-BAY-01	Ojo Main Street 1	10 Obafemi Awolowo Way, Ojo	5	200.00	{"open": "08:00", "close": "20:00"}	39	20
OJO130-BAY-02	Ojo Main Street 2	20 Obafemi Awolowo Way, Ojo	5	200.00	{"open": "08:00", "close": "20:00"}	40	20
SHO131-BAY-01	Shomolu Main Street 1	10 Obafemi Awolowo Way, Shomolu	5	200.00	{"open": "08:00", "close": "20:00"}	41	21
SHO131-BAY-02	Shomolu Main Street 2	20 Obafemi Awolowo Way, Shomolu	5	200.00	{"open": "08:00", "close": "20:00"}	42	21


--
-- Data for Name: parking_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_requests (id, customer_id, vehicle_id, zone_id, bay_id, slot_id, start_time, duration_hours, status, created_at, updated_at) FROM stdin;
1	1	1	1	\N	\N	2026-02-07 13:37:51.325	2	PENDING	2026-02-07 13:37:51.326	2026-02-07 13:37:51.326
2	2	2	2	\N	\N	2026-02-07 14:37:51.331	2	APPROVED	2026-02-07 13:37:51.332	2026-02-07 13:37:51.332
3	3	3	3	\N	\N	2026-02-07 15:37:51.334	2	APPROVED	2026-02-07 13:37:51.335	2026-02-07 13:37:51.335
4	1	4	4	\N	\N	2026-02-07 16:37:51.336	4	APPROVED	2026-02-07 13:37:51.337	2026-02-07 13:37:51.337
5	2	5	5	\N	\N	2026-02-07 17:37:51.338	4	PENDING	2026-02-07 13:37:51.338	2026-02-07 13:37:51.338
6	3	1	6	\N	\N	2026-02-07 18:37:51.339	2	APPROVED	2026-02-07 13:37:51.34	2026-02-07 13:37:51.34
7	1	2	7	\N	\N	2026-02-07 19:37:51.341	4	APPROVED	2026-02-07 13:37:51.341	2026-02-07 13:37:51.341
8	2	3	8	\N	\N	2026-02-07 20:37:51.342	2	APPROVED	2026-02-07 13:37:51.343	2026-02-07 13:37:51.343
9	3	4	9	\N	\N	2026-02-07 21:37:51.344	4	PENDING	2026-02-07 13:37:51.344	2026-02-07 13:37:51.344
10	1	5	10	\N	\N	2026-02-07 22:37:51.347	1	APPROVED	2026-02-07 13:37:51.348	2026-02-07 13:37:51.348
11	2	1	11	\N	\N	2026-02-07 23:37:51.35	2	APPROVED	2026-02-07 13:37:51.351	2026-02-07 13:37:51.351
12	3	2	12	\N	\N	2026-02-08 00:37:51.352	1	APPROVED	2026-02-07 13:37:51.353	2026-02-07 13:37:51.353
13	1	3	13	\N	\N	2026-02-08 01:37:51.354	2	PENDING	2026-02-07 13:37:51.354	2026-02-07 13:37:51.354
14	2	4	14	\N	\N	2026-02-08 02:37:51.356	4	APPROVED	2026-02-07 13:37:51.356	2026-02-07 13:37:51.356
15	3	5	15	\N	\N	2026-02-08 03:37:51.357	1	APPROVED	2026-02-07 13:37:51.358	2026-02-07 13:37:51.358
16	1	1	16	\N	\N	2026-02-08 04:37:51.359	3	APPROVED	2026-02-07 13:37:51.36	2026-02-07 13:37:51.36
17	2	2	17	\N	\N	2026-02-08 05:37:51.361	2	PENDING	2026-02-07 13:37:51.362	2026-02-07 13:37:51.362
18	3	3	18	\N	\N	2026-02-08 06:37:51.365	2	APPROVED	2026-02-07 13:37:51.366	2026-02-07 13:37:51.366
19	1	4	19	\N	\N	2026-02-08 07:37:51.367	2	APPROVED	2026-02-07 13:37:51.368	2026-02-07 13:37:51.368
20	2	5	20	\N	\N	2026-02-08 08:37:51.369	2	APPROVED	2026-02-07 13:37:51.37	2026-02-07 13:37:51.37
21	1	1	1	\N	\N	2026-02-07 16:15:31.782	2	PENDING	2026-02-07 16:15:31.783	2026-02-07 16:15:31.783
22	2	2	2	\N	\N	2026-02-07 17:15:31.788	1	APPROVED	2026-02-07 16:15:31.788	2026-02-07 16:15:31.788
23	3	3	3	\N	\N	2026-02-07 18:15:31.789	2	APPROVED	2026-02-07 16:15:31.79	2026-02-07 16:15:31.79
24	1	4	4	\N	\N	2026-02-07 19:15:31.791	4	APPROVED	2026-02-07 16:15:31.791	2026-02-07 16:15:31.791
25	2	5	5	\N	\N	2026-02-07 20:15:31.792	3	PENDING	2026-02-07 16:15:31.792	2026-02-07 16:15:31.792
26	3	1	6	\N	\N	2026-02-07 21:15:31.793	1	APPROVED	2026-02-07 16:15:31.793	2026-02-07 16:15:31.793
27	1	2	7	\N	\N	2026-02-07 22:15:31.794	3	APPROVED	2026-02-07 16:15:31.795	2026-02-07 16:15:31.795
28	2	3	8	\N	\N	2026-02-07 23:15:31.796	3	APPROVED	2026-02-07 16:15:31.796	2026-02-07 16:15:31.796
29	3	4	9	\N	\N	2026-02-08 00:15:31.797	3	PENDING	2026-02-07 16:15:31.797	2026-02-07 16:15:31.797
30	1	5	10	\N	\N	2026-02-08 01:15:31.798	4	APPROVED	2026-02-07 16:15:31.798	2026-02-07 16:15:31.798
31	2	1	11	\N	\N	2026-02-08 02:15:31.799	4	APPROVED	2026-02-07 16:15:31.8	2026-02-07 16:15:31.8
32	3	2	12	\N	\N	2026-02-08 03:15:31.803	3	APPROVED	2026-02-07 16:15:31.804	2026-02-07 16:15:31.804
33	1	3	13	\N	\N	2026-02-08 04:15:31.805	3	PENDING	2026-02-07 16:15:31.806	2026-02-07 16:15:31.806
34	2	4	14	\N	\N	2026-02-08 05:15:31.807	1	APPROVED	2026-02-07 16:15:31.807	2026-02-07 16:15:31.807
35	3	5	15	\N	\N	2026-02-08 06:15:31.808	4	APPROVED	2026-02-07 16:15:31.808	2026-02-07 16:15:31.808
36	1	1	16	\N	\N	2026-02-08 07:15:31.809	3	APPROVED	2026-02-07 16:15:31.81	2026-02-07 16:15:31.81
37	2	2	17	\N	\N	2026-02-08 08:15:31.811	2	PENDING	2026-02-07 16:15:31.811	2026-02-07 16:15:31.811
38	3	3	18	\N	\N	2026-02-08 09:15:31.813	2	APPROVED	2026-02-07 16:15:31.814	2026-02-07 16:15:31.814
39	1	4	19	\N	\N	2026-02-08 10:15:31.814	1	APPROVED	2026-02-07 16:15:31.815	2026-02-07 16:15:31.815
40	2	5	20	\N	\N	2026-02-08 11:15:31.816	4	APPROVED	2026-02-07 16:15:31.818	2026-02-07 16:15:31.818


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_slots (slot_number, status, sensor_id, id, bay_id) FROM stdin;
SLOT-01	AVAILABLE	SN-IKJ111-BAY-01-1	1	1
SLOT-02	OCCUPIED	SN-IKJ111-BAY-01-2	2	1
SLOT-03	AVAILABLE	SN-IKJ111-BAY-01-3	3	1
SLOT-04	AVAILABLE	SN-IKJ111-BAY-01-4	4	1
SLOT-05	OCCUPIED	SN-IKJ111-BAY-01-5	5	1
SLOT-01	OCCUPIED	SN-IKJ111-BAY-02-1	6	2
SLOT-02	OCCUPIED	SN-IKJ111-BAY-02-2	7	2
SLOT-03	AVAILABLE	SN-IKJ111-BAY-02-3	8	2
SLOT-04	AVAILABLE	SN-IKJ111-BAY-02-4	9	2
SLOT-05	OCCUPIED	SN-IKJ111-BAY-02-5	10	2
SLOT-01	AVAILABLE	SN-AGE112-BAY-01-1	11	3
SLOT-02	OCCUPIED	SN-AGE112-BAY-01-2	12	3
SLOT-03	OCCUPIED	SN-AGE112-BAY-01-3	13	3
SLOT-04	AVAILABLE	SN-AGE112-BAY-01-4	14	3
SLOT-05	OCCUPIED	SN-AGE112-BAY-01-5	15	3
SLOT-01	OCCUPIED	SN-AGE112-BAY-02-1	16	4
SLOT-02	AVAILABLE	SN-AGE112-BAY-02-2	17	4
SLOT-03	AVAILABLE	SN-AGE112-BAY-02-3	18	4
SLOT-04	AVAILABLE	SN-AGE112-BAY-02-4	19	4
SLOT-05	AVAILABLE	SN-AGE112-BAY-02-5	20	4
SLOT-01	AVAILABLE	SN-ALI113-BAY-01-1	21	5
SLOT-02	AVAILABLE	SN-ALI113-BAY-01-2	22	5
SLOT-03	AVAILABLE	SN-ALI113-BAY-01-3	23	5
SLOT-04	AVAILABLE	SN-ALI113-BAY-01-4	24	5
SLOT-05	AVAILABLE	SN-ALI113-BAY-01-5	25	5
SLOT-01	AVAILABLE	SN-ALI113-BAY-02-1	26	6
SLOT-02	AVAILABLE	SN-ALI113-BAY-02-2	27	6
SLOT-03	OCCUPIED	SN-ALI113-BAY-02-3	28	6
SLOT-04	AVAILABLE	SN-ALI113-BAY-02-4	29	6
SLOT-05	AVAILABLE	SN-ALI113-BAY-02-5	30	6
SLOT-01	OCCUPIED	SN-LAS114-BAY-01-1	31	7
SLOT-02	OCCUPIED	SN-LAS114-BAY-01-2	32	7
SLOT-03	AVAILABLE	SN-LAS114-BAY-01-3	33	7
SLOT-04	AVAILABLE	SN-LAS114-BAY-01-4	34	7
SLOT-05	AVAILABLE	SN-LAS114-BAY-01-5	35	7
SLOT-01	OCCUPIED	SN-LAS114-BAY-02-1	36	8
SLOT-02	AVAILABLE	SN-LAS114-BAY-02-2	37	8
SLOT-03	OCCUPIED	SN-LAS114-BAY-02-3	38	8
SLOT-04	AVAILABLE	SN-LAS114-BAY-02-4	39	8
SLOT-05	AVAILABLE	SN-LAS114-BAY-02-5	40	8
SLOT-01	AVAILABLE	SN-LMN115-BAY-01-1	41	9
SLOT-02	AVAILABLE	SN-LMN115-BAY-01-2	42	9
SLOT-03	AVAILABLE	SN-LMN115-BAY-01-3	43	9
SLOT-04	OCCUPIED	SN-LMN115-BAY-01-4	44	9
SLOT-05	AVAILABLE	SN-LMN115-BAY-01-5	45	9
SLOT-01	AVAILABLE	SN-LMN115-BAY-02-1	46	10
SLOT-02	AVAILABLE	SN-LMN115-BAY-02-2	47	10
SLOT-03	AVAILABLE	SN-LMN115-BAY-02-3	48	10
SLOT-04	OCCUPIED	SN-LMN115-BAY-02-4	49	10
SLOT-05	OCCUPIED	SN-LMN115-BAY-02-5	50	10
SLOT-01	OCCUPIED	SN-MSN116-BAY-01-1	51	11
SLOT-02	AVAILABLE	SN-MSN116-BAY-01-2	52	11
SLOT-03	AVAILABLE	SN-MSN116-BAY-01-3	53	11
SLOT-04	OCCUPIED	SN-MSN116-BAY-01-4	54	11
SLOT-05	AVAILABLE	SN-MSN116-BAY-01-5	55	11
SLOT-01	OCCUPIED	SN-MSN116-BAY-02-1	56	12
SLOT-02	AVAILABLE	SN-MSN116-BAY-02-2	57	12
SLOT-03	AVAILABLE	SN-MSN116-BAY-02-3	58	12
SLOT-04	AVAILABLE	SN-MSN116-BAY-02-4	59	12
SLOT-05	AVAILABLE	SN-MSN116-BAY-02-5	60	12
SLOT-01	AVAILABLE	SN-OSS118-BAY-01-1	61	13
SLOT-02	OCCUPIED	SN-OSS118-BAY-01-2	62	13
SLOT-03	OCCUPIED	SN-OSS118-BAY-01-3	63	13
SLOT-04	AVAILABLE	SN-OSS118-BAY-01-4	64	13
SLOT-05	AVAILABLE	SN-OSS118-BAY-01-5	65	13
SLOT-01	OCCUPIED	SN-OSS118-BAY-02-1	66	14
SLOT-02	OCCUPIED	SN-OSS118-BAY-02-2	67	14
SLOT-03	AVAILABLE	SN-OSS118-BAY-02-3	68	14
SLOT-04	AVAILABLE	SN-OSS118-BAY-02-4	69	14
SLOT-05	AVAILABLE	SN-OSS118-BAY-02-5	70	14
SLOT-01	AVAILABLE	SN-APA119-BAY-01-1	71	15
SLOT-02	OCCUPIED	SN-APA119-BAY-01-2	72	15
SLOT-03	AVAILABLE	SN-APA119-BAY-01-3	73	15
SLOT-04	AVAILABLE	SN-APA119-BAY-01-4	74	15
SLOT-05	AVAILABLE	SN-APA119-BAY-01-5	75	15
SLOT-01	AVAILABLE	SN-APA119-BAY-02-1	76	16
SLOT-02	AVAILABLE	SN-APA119-BAY-02-2	77	16
SLOT-03	AVAILABLE	SN-APA119-BAY-02-3	78	16
SLOT-04	OCCUPIED	SN-APA119-BAY-02-4	79	16
SLOT-05	OCCUPIED	SN-APA119-BAY-02-5	80	16
SLOT-01	OCCUPIED	SN-SUR120-BAY-01-1	81	17
SLOT-02	AVAILABLE	SN-SUR120-BAY-01-2	82	17
SLOT-03	AVAILABLE	SN-SUR120-BAY-01-3	83	17
SLOT-04	AVAILABLE	SN-SUR120-BAY-01-4	84	17
SLOT-05	AVAILABLE	SN-SUR120-BAY-01-5	85	17
SLOT-01	OCCUPIED	SN-SUR120-BAY-02-1	86	18
SLOT-02	OCCUPIED	SN-SUR120-BAY-02-2	87	18
SLOT-03	AVAILABLE	SN-SUR120-BAY-02-3	88	18
SLOT-04	OCCUPIED	SN-SUR120-BAY-02-4	89	18
SLOT-05	OCCUPIED	SN-SUR120-BAY-02-5	90	18
SLOT-01	AVAILABLE	SN-EOS121-BAY-01-1	91	19
SLOT-02	AVAILABLE	SN-EOS121-BAY-01-2	92	19
SLOT-03	AVAILABLE	SN-EOS121-BAY-01-3	93	19
SLOT-04	AVAILABLE	SN-EOS121-BAY-01-4	94	19
SLOT-05	AVAILABLE	SN-EOS121-BAY-01-5	95	19
SLOT-01	AVAILABLE	SN-EOS121-BAY-02-1	96	20
SLOT-02	AVAILABLE	SN-EOS121-BAY-02-2	97	20
SLOT-03	AVAILABLE	SN-EOS121-BAY-02-3	98	20
SLOT-04	OCCUPIED	SN-EOS121-BAY-02-4	99	20
SLOT-05	AVAILABLE	SN-EOS121-BAY-02-5	100	20
SLOT-01	AVAILABLE	SN-VIB122-BAY-01-1	101	21
SLOT-02	AVAILABLE	SN-VIB122-BAY-01-2	102	21
SLOT-03	AVAILABLE	SN-VIB122-BAY-01-3	103	21
SLOT-04	AVAILABLE	SN-VIB122-BAY-01-4	104	21
SLOT-05	OCCUPIED	SN-VIB122-BAY-01-5	105	21
SLOT-01	AVAILABLE	SN-VIB122-BAY-02-1	106	22
SLOT-02	OCCUPIED	SN-VIB122-BAY-02-2	107	22
SLOT-03	OCCUPIED	SN-VIB122-BAY-02-3	108	22
SLOT-04	OCCUPIED	SN-VIB122-BAY-02-4	109	22
SLOT-05	AVAILABLE	SN-VIB122-BAY-02-5	110	22
SLOT-01	OCCUPIED	SN-IKD112-BAY-01-1	111	23
SLOT-02	OCCUPIED	SN-IKD112-BAY-01-2	112	23
SLOT-03	AVAILABLE	SN-IKD112-BAY-01-3	113	23
SLOT-04	AVAILABLE	SN-IKD112-BAY-01-4	114	23
SLOT-05	AVAILABLE	SN-IKD112-BAY-01-5	115	23
SLOT-01	AVAILABLE	SN-IKD112-BAY-02-1	116	24
SLOT-02	AVAILABLE	SN-IKD112-BAY-02-2	117	24
SLOT-03	AVAILABLE	SN-IKD112-BAY-02-3	118	24
SLOT-04	OCCUPIED	SN-IKD112-BAY-02-4	119	24
SLOT-05	AVAILABLE	SN-IKD112-BAY-02-5	120	24
SLOT-01	AVAILABLE	SN-AJI123-BAY-01-1	121	25
SLOT-02	OCCUPIED	SN-AJI123-BAY-01-2	122	25
SLOT-03	AVAILABLE	SN-AJI123-BAY-01-3	123	25
SLOT-04	AVAILABLE	SN-AJI123-BAY-01-4	124	25
SLOT-05	OCCUPIED	SN-AJI123-BAY-01-5	125	25
SLOT-01	AVAILABLE	SN-AJI123-BAY-02-1	126	26
SLOT-02	AVAILABLE	SN-AJI123-BAY-02-2	127	26
SLOT-03	OCCUPIED	SN-AJI123-BAY-02-3	128	26
SLOT-04	AVAILABLE	SN-AJI123-BAY-02-4	129	26
SLOT-05	AVAILABLE	SN-AJI123-BAY-02-5	130	26
SLOT-01	AVAILABLE	SN-AMO124-BAY-01-1	131	27
SLOT-02	OCCUPIED	SN-AMO124-BAY-01-2	132	27
SLOT-03	AVAILABLE	SN-AMO124-BAY-01-3	133	27
SLOT-04	AVAILABLE	SN-AMO124-BAY-01-4	134	27
SLOT-05	AVAILABLE	SN-AMO124-BAY-01-5	135	27
SLOT-01	AVAILABLE	SN-AMO124-BAY-02-1	136	28
SLOT-02	AVAILABLE	SN-AMO124-BAY-02-2	137	28
SLOT-03	AVAILABLE	SN-AMO124-BAY-02-3	138	28
SLOT-04	AVAILABLE	SN-AMO124-BAY-02-4	139	28
SLOT-05	AVAILABLE	SN-AMO124-BAY-02-5	140	28
SLOT-01	AVAILABLE	SN-BAD125-BAY-01-1	141	29
SLOT-02	OCCUPIED	SN-BAD125-BAY-01-2	142	29
SLOT-03	OCCUPIED	SN-BAD125-BAY-01-3	143	29
SLOT-04	AVAILABLE	SN-BAD125-BAY-01-4	144	29
SLOT-05	AVAILABLE	SN-BAD125-BAY-01-5	145	29
SLOT-01	AVAILABLE	SN-BAD125-BAY-02-1	146	30
SLOT-02	OCCUPIED	SN-BAD125-BAY-02-2	147	30
SLOT-03	OCCUPIED	SN-BAD125-BAY-02-3	148	30
SLOT-04	AVAILABLE	SN-BAD125-BAY-02-4	149	30
SLOT-05	AVAILABLE	SN-BAD125-BAY-02-5	150	30
SLOT-01	AVAILABLE	SN-EPE126-BAY-01-1	151	31
SLOT-02	AVAILABLE	SN-EPE126-BAY-01-2	152	31
SLOT-03	OCCUPIED	SN-EPE126-BAY-01-3	153	31
SLOT-04	OCCUPIED	SN-EPE126-BAY-01-4	154	31
SLOT-05	OCCUPIED	SN-EPE126-BAY-01-5	155	31
SLOT-01	AVAILABLE	SN-EPE126-BAY-02-1	156	32
SLOT-02	AVAILABLE	SN-EPE126-BAY-02-2	157	32
SLOT-03	AVAILABLE	SN-EPE126-BAY-02-3	158	32
SLOT-04	AVAILABLE	SN-EPE126-BAY-02-4	159	32
SLOT-05	OCCUPIED	SN-EPE126-BAY-02-5	160	32
SLOT-01	OCCUPIED	SN-IBL127-BAY-01-1	161	33
SLOT-02	OCCUPIED	SN-IBL127-BAY-01-2	162	33
SLOT-03	AVAILABLE	SN-IBL127-BAY-01-3	163	33
SLOT-04	OCCUPIED	SN-IBL127-BAY-01-4	164	33
SLOT-05	AVAILABLE	SN-IBL127-BAY-01-5	165	33
SLOT-01	AVAILABLE	SN-IBL127-BAY-02-1	166	34
SLOT-02	OCCUPIED	SN-IBL127-BAY-02-2	167	34
SLOT-03	AVAILABLE	SN-IBL127-BAY-02-3	168	34
SLOT-04	AVAILABLE	SN-IBL127-BAY-02-4	169	34
SLOT-05	AVAILABLE	SN-IBL127-BAY-02-5	170	34
SLOT-01	OCCUPIED	SN-IFA128-BAY-01-1	171	35
SLOT-02	AVAILABLE	SN-IFA128-BAY-01-2	172	35
SLOT-03	AVAILABLE	SN-IFA128-BAY-01-3	173	35
SLOT-04	AVAILABLE	SN-IFA128-BAY-01-4	174	35
SLOT-05	AVAILABLE	SN-IFA128-BAY-01-5	175	35
SLOT-01	AVAILABLE	SN-IFA128-BAY-02-1	176	36
SLOT-02	AVAILABLE	SN-IFA128-BAY-02-2	177	36
SLOT-03	AVAILABLE	SN-IFA128-BAY-02-3	178	36
SLOT-04	AVAILABLE	SN-IFA128-BAY-02-4	179	36
SLOT-05	AVAILABLE	SN-IFA128-BAY-02-5	180	36
SLOT-01	AVAILABLE	SN-KOS129-BAY-01-1	181	37
SLOT-02	AVAILABLE	SN-KOS129-BAY-01-2	182	37
SLOT-03	AVAILABLE	SN-KOS129-BAY-01-3	183	37
SLOT-04	OCCUPIED	SN-KOS129-BAY-01-4	184	37
SLOT-05	AVAILABLE	SN-KOS129-BAY-01-5	185	37
SLOT-01	OCCUPIED	SN-KOS129-BAY-02-1	186	38
SLOT-02	AVAILABLE	SN-KOS129-BAY-02-2	187	38
SLOT-03	AVAILABLE	SN-KOS129-BAY-02-3	188	38
SLOT-04	OCCUPIED	SN-KOS129-BAY-02-4	189	38
SLOT-05	AVAILABLE	SN-KOS129-BAY-02-5	190	38
SLOT-01	AVAILABLE	SN-OJO130-BAY-01-1	191	39
SLOT-02	AVAILABLE	SN-OJO130-BAY-01-2	192	39
SLOT-03	OCCUPIED	SN-OJO130-BAY-01-3	193	39
SLOT-04	AVAILABLE	SN-OJO130-BAY-01-4	194	39
SLOT-05	AVAILABLE	SN-OJO130-BAY-01-5	195	39
SLOT-01	AVAILABLE	SN-OJO130-BAY-02-1	196	40
SLOT-02	AVAILABLE	SN-OJO130-BAY-02-2	197	40
SLOT-03	AVAILABLE	SN-OJO130-BAY-02-3	198	40
SLOT-04	AVAILABLE	SN-OJO130-BAY-02-4	199	40
SLOT-05	OCCUPIED	SN-OJO130-BAY-02-5	200	40
SLOT-01	AVAILABLE	SN-SHO131-BAY-01-1	201	41
SLOT-02	AVAILABLE	SN-SHO131-BAY-01-2	202	41
SLOT-03	OCCUPIED	SN-SHO131-BAY-01-3	203	41
SLOT-04	AVAILABLE	SN-SHO131-BAY-01-4	204	41
SLOT-05	AVAILABLE	SN-SHO131-BAY-01-5	205	41
SLOT-01	AVAILABLE	SN-SHO131-BAY-02-1	206	42
SLOT-02	AVAILABLE	SN-SHO131-BAY-02-2	207	42
SLOT-03	AVAILABLE	SN-SHO131-BAY-02-3	208	42
SLOT-04	AVAILABLE	SN-SHO131-BAY-02-4	209	42
SLOT-05	AVAILABLE	SN-SHO131-BAY-02-5	210	42
SLOT-01	AVAILABLE	SN-IKJ111-BAY-01-1	211	1
SLOT-02	AVAILABLE	SN-IKJ111-BAY-01-2	212	1
SLOT-03	AVAILABLE	SN-IKJ111-BAY-01-3	213	1
SLOT-04	AVAILABLE	SN-IKJ111-BAY-01-4	214	1
SLOT-05	AVAILABLE	SN-IKJ111-BAY-01-5	215	1
SLOT-01	AVAILABLE	SN-IKJ111-BAY-02-1	216	2
SLOT-02	AVAILABLE	SN-IKJ111-BAY-02-2	217	2
SLOT-03	OCCUPIED	SN-IKJ111-BAY-02-3	218	2
SLOT-04	AVAILABLE	SN-IKJ111-BAY-02-4	219	2
SLOT-05	AVAILABLE	SN-IKJ111-BAY-02-5	220	2
SLOT-01	OCCUPIED	SN-AGE112-BAY-01-1	221	3
SLOT-02	OCCUPIED	SN-AGE112-BAY-01-2	222	3
SLOT-03	AVAILABLE	SN-AGE112-BAY-01-3	223	3
SLOT-04	AVAILABLE	SN-AGE112-BAY-01-4	224	3
SLOT-05	AVAILABLE	SN-AGE112-BAY-01-5	225	3
SLOT-01	AVAILABLE	SN-AGE112-BAY-02-1	226	4
SLOT-02	AVAILABLE	SN-AGE112-BAY-02-2	227	4
SLOT-03	AVAILABLE	SN-AGE112-BAY-02-3	228	4
SLOT-04	AVAILABLE	SN-AGE112-BAY-02-4	229	4
SLOT-05	AVAILABLE	SN-AGE112-BAY-02-5	230	4
SLOT-01	AVAILABLE	SN-ALI113-BAY-01-1	231	5
SLOT-02	AVAILABLE	SN-ALI113-BAY-01-2	232	5
SLOT-03	AVAILABLE	SN-ALI113-BAY-01-3	233	5
SLOT-04	AVAILABLE	SN-ALI113-BAY-01-4	234	5
SLOT-05	OCCUPIED	SN-ALI113-BAY-01-5	235	5
SLOT-01	AVAILABLE	SN-ALI113-BAY-02-1	236	6
SLOT-02	OCCUPIED	SN-ALI113-BAY-02-2	237	6
SLOT-03	OCCUPIED	SN-ALI113-BAY-02-3	238	6
SLOT-04	OCCUPIED	SN-ALI113-BAY-02-4	239	6
SLOT-05	OCCUPIED	SN-ALI113-BAY-02-5	240	6
SLOT-01	AVAILABLE	SN-LAS114-BAY-01-1	241	7
SLOT-02	AVAILABLE	SN-LAS114-BAY-01-2	242	7
SLOT-03	AVAILABLE	SN-LAS114-BAY-01-3	243	7
SLOT-04	AVAILABLE	SN-LAS114-BAY-01-4	244	7
SLOT-05	OCCUPIED	SN-LAS114-BAY-01-5	245	7
SLOT-01	OCCUPIED	SN-LAS114-BAY-02-1	246	8
SLOT-02	OCCUPIED	SN-LAS114-BAY-02-2	247	8
SLOT-03	AVAILABLE	SN-LAS114-BAY-02-3	248	8
SLOT-04	AVAILABLE	SN-LAS114-BAY-02-4	249	8
SLOT-05	AVAILABLE	SN-LAS114-BAY-02-5	250	8
SLOT-01	OCCUPIED	SN-LMN115-BAY-01-1	251	9
SLOT-02	OCCUPIED	SN-LMN115-BAY-01-2	252	9
SLOT-03	AVAILABLE	SN-LMN115-BAY-01-3	253	9
SLOT-04	OCCUPIED	SN-LMN115-BAY-01-4	254	9
SLOT-05	AVAILABLE	SN-LMN115-BAY-01-5	255	9
SLOT-01	OCCUPIED	SN-LMN115-BAY-02-1	256	10
SLOT-02	OCCUPIED	SN-LMN115-BAY-02-2	257	10
SLOT-03	AVAILABLE	SN-LMN115-BAY-02-3	258	10
SLOT-04	OCCUPIED	SN-LMN115-BAY-02-4	259	10
SLOT-05	AVAILABLE	SN-LMN115-BAY-02-5	260	10
SLOT-01	AVAILABLE	SN-MSN116-BAY-01-1	261	11
SLOT-02	AVAILABLE	SN-MSN116-BAY-01-2	262	11
SLOT-03	AVAILABLE	SN-MSN116-BAY-01-3	263	11
SLOT-04	AVAILABLE	SN-MSN116-BAY-01-4	264	11
SLOT-05	AVAILABLE	SN-MSN116-BAY-01-5	265	11
SLOT-01	AVAILABLE	SN-MSN116-BAY-02-1	266	12
SLOT-02	AVAILABLE	SN-MSN116-BAY-02-2	267	12
SLOT-03	AVAILABLE	SN-MSN116-BAY-02-3	268	12
SLOT-04	AVAILABLE	SN-MSN116-BAY-02-4	269	12
SLOT-05	OCCUPIED	SN-MSN116-BAY-02-5	270	12
SLOT-01	OCCUPIED	SN-OSS118-BAY-01-1	271	13
SLOT-02	AVAILABLE	SN-OSS118-BAY-01-2	272	13
SLOT-03	OCCUPIED	SN-OSS118-BAY-01-3	273	13
SLOT-04	AVAILABLE	SN-OSS118-BAY-01-4	274	13
SLOT-05	AVAILABLE	SN-OSS118-BAY-01-5	275	13
SLOT-01	AVAILABLE	SN-OSS118-BAY-02-1	276	14
SLOT-02	AVAILABLE	SN-OSS118-BAY-02-2	277	14
SLOT-03	AVAILABLE	SN-OSS118-BAY-02-3	278	14
SLOT-04	AVAILABLE	SN-OSS118-BAY-02-4	279	14
SLOT-05	OCCUPIED	SN-OSS118-BAY-02-5	280	14
SLOT-01	OCCUPIED	SN-APA119-BAY-01-1	281	15
SLOT-02	AVAILABLE	SN-APA119-BAY-01-2	282	15
SLOT-03	AVAILABLE	SN-APA119-BAY-01-3	283	15
SLOT-04	OCCUPIED	SN-APA119-BAY-01-4	284	15
SLOT-05	AVAILABLE	SN-APA119-BAY-01-5	285	15
SLOT-01	AVAILABLE	SN-APA119-BAY-02-1	286	16
SLOT-02	OCCUPIED	SN-APA119-BAY-02-2	287	16
SLOT-03	OCCUPIED	SN-APA119-BAY-02-3	288	16
SLOT-04	AVAILABLE	SN-APA119-BAY-02-4	289	16
SLOT-05	AVAILABLE	SN-APA119-BAY-02-5	290	16
SLOT-01	AVAILABLE	SN-SUR120-BAY-01-1	291	17
SLOT-02	AVAILABLE	SN-SUR120-BAY-01-2	292	17
SLOT-03	OCCUPIED	SN-SUR120-BAY-01-3	293	17
SLOT-04	AVAILABLE	SN-SUR120-BAY-01-4	294	17
SLOT-05	AVAILABLE	SN-SUR120-BAY-01-5	295	17
SLOT-01	OCCUPIED	SN-SUR120-BAY-02-1	296	18
SLOT-02	AVAILABLE	SN-SUR120-BAY-02-2	297	18
SLOT-03	AVAILABLE	SN-SUR120-BAY-02-3	298	18
SLOT-04	AVAILABLE	SN-SUR120-BAY-02-4	299	18
SLOT-05	AVAILABLE	SN-SUR120-BAY-02-5	300	18
SLOT-01	OCCUPIED	SN-EOS121-BAY-01-1	301	19
SLOT-02	AVAILABLE	SN-EOS121-BAY-01-2	302	19
SLOT-03	AVAILABLE	SN-EOS121-BAY-01-3	303	19
SLOT-04	OCCUPIED	SN-EOS121-BAY-01-4	304	19
SLOT-05	OCCUPIED	SN-EOS121-BAY-01-5	305	19
SLOT-01	AVAILABLE	SN-EOS121-BAY-02-1	306	20
SLOT-02	AVAILABLE	SN-EOS121-BAY-02-2	307	20
SLOT-03	OCCUPIED	SN-EOS121-BAY-02-3	308	20
SLOT-04	AVAILABLE	SN-EOS121-BAY-02-4	309	20
SLOT-05	AVAILABLE	SN-EOS121-BAY-02-5	310	20
SLOT-01	AVAILABLE	SN-VIB122-BAY-01-1	311	21
SLOT-02	AVAILABLE	SN-VIB122-BAY-01-2	312	21
SLOT-03	AVAILABLE	SN-VIB122-BAY-01-3	313	21
SLOT-04	AVAILABLE	SN-VIB122-BAY-01-4	314	21
SLOT-05	AVAILABLE	SN-VIB122-BAY-01-5	315	21
SLOT-01	OCCUPIED	SN-VIB122-BAY-02-1	316	22
SLOT-02	AVAILABLE	SN-VIB122-BAY-02-2	317	22
SLOT-03	AVAILABLE	SN-VIB122-BAY-02-3	318	22
SLOT-04	AVAILABLE	SN-VIB122-BAY-02-4	319	22
SLOT-05	AVAILABLE	SN-VIB122-BAY-02-5	320	22
SLOT-01	AVAILABLE	SN-IKD112-BAY-01-1	321	23
SLOT-02	AVAILABLE	SN-IKD112-BAY-01-2	322	23
SLOT-03	AVAILABLE	SN-IKD112-BAY-01-3	323	23
SLOT-04	AVAILABLE	SN-IKD112-BAY-01-4	324	23
SLOT-05	AVAILABLE	SN-IKD112-BAY-01-5	325	23
SLOT-01	AVAILABLE	SN-IKD112-BAY-02-1	326	24
SLOT-02	AVAILABLE	SN-IKD112-BAY-02-2	327	24
SLOT-03	AVAILABLE	SN-IKD112-BAY-02-3	328	24
SLOT-04	AVAILABLE	SN-IKD112-BAY-02-4	329	24
SLOT-05	AVAILABLE	SN-IKD112-BAY-02-5	330	24
SLOT-01	AVAILABLE	SN-AJI123-BAY-01-1	331	25
SLOT-02	OCCUPIED	SN-AJI123-BAY-01-2	332	25
SLOT-03	AVAILABLE	SN-AJI123-BAY-01-3	333	25
SLOT-04	AVAILABLE	SN-AJI123-BAY-01-4	334	25
SLOT-05	AVAILABLE	SN-AJI123-BAY-01-5	335	25
SLOT-01	AVAILABLE	SN-AJI123-BAY-02-1	336	26
SLOT-02	AVAILABLE	SN-AJI123-BAY-02-2	337	26
SLOT-03	OCCUPIED	SN-AJI123-BAY-02-3	338	26
SLOT-04	OCCUPIED	SN-AJI123-BAY-02-4	339	26
SLOT-05	AVAILABLE	SN-AJI123-BAY-02-5	340	26
SLOT-01	OCCUPIED	SN-AMO124-BAY-01-1	341	27
SLOT-02	AVAILABLE	SN-AMO124-BAY-01-2	342	27
SLOT-03	AVAILABLE	SN-AMO124-BAY-01-3	343	27
SLOT-04	OCCUPIED	SN-AMO124-BAY-01-4	344	27
SLOT-05	OCCUPIED	SN-AMO124-BAY-01-5	345	27
SLOT-01	OCCUPIED	SN-AMO124-BAY-02-1	346	28
SLOT-02	OCCUPIED	SN-AMO124-BAY-02-2	347	28
SLOT-03	AVAILABLE	SN-AMO124-BAY-02-3	348	28
SLOT-04	AVAILABLE	SN-AMO124-BAY-02-4	349	28
SLOT-05	OCCUPIED	SN-AMO124-BAY-02-5	350	28
SLOT-01	AVAILABLE	SN-BAD125-BAY-01-1	351	29
SLOT-02	AVAILABLE	SN-BAD125-BAY-01-2	352	29
SLOT-03	AVAILABLE	SN-BAD125-BAY-01-3	353	29
SLOT-04	AVAILABLE	SN-BAD125-BAY-01-4	354	29
SLOT-05	AVAILABLE	SN-BAD125-BAY-01-5	355	29
SLOT-01	AVAILABLE	SN-BAD125-BAY-02-1	356	30
SLOT-02	AVAILABLE	SN-BAD125-BAY-02-2	357	30
SLOT-03	AVAILABLE	SN-BAD125-BAY-02-3	358	30
SLOT-04	OCCUPIED	SN-BAD125-BAY-02-4	359	30
SLOT-05	AVAILABLE	SN-BAD125-BAY-02-5	360	30
SLOT-01	AVAILABLE	SN-EPE126-BAY-01-1	361	31
SLOT-02	AVAILABLE	SN-EPE126-BAY-01-2	362	31
SLOT-03	OCCUPIED	SN-EPE126-BAY-01-3	363	31
SLOT-04	OCCUPIED	SN-EPE126-BAY-01-4	364	31
SLOT-05	OCCUPIED	SN-EPE126-BAY-01-5	365	31
SLOT-01	AVAILABLE	SN-EPE126-BAY-02-1	366	32
SLOT-02	AVAILABLE	SN-EPE126-BAY-02-2	367	32
SLOT-03	AVAILABLE	SN-EPE126-BAY-02-3	368	32
SLOT-04	OCCUPIED	SN-EPE126-BAY-02-4	369	32
SLOT-05	AVAILABLE	SN-EPE126-BAY-02-5	370	32
SLOT-01	AVAILABLE	SN-IBL127-BAY-01-1	371	33
SLOT-02	AVAILABLE	SN-IBL127-BAY-01-2	372	33
SLOT-03	OCCUPIED	SN-IBL127-BAY-01-3	373	33
SLOT-04	AVAILABLE	SN-IBL127-BAY-01-4	374	33
SLOT-05	OCCUPIED	SN-IBL127-BAY-01-5	375	33
SLOT-01	AVAILABLE	SN-IBL127-BAY-02-1	376	34
SLOT-02	OCCUPIED	SN-IBL127-BAY-02-2	377	34
SLOT-03	AVAILABLE	SN-IBL127-BAY-02-3	378	34
SLOT-04	OCCUPIED	SN-IBL127-BAY-02-4	379	34
SLOT-05	AVAILABLE	SN-IBL127-BAY-02-5	380	34
SLOT-01	AVAILABLE	SN-IFA128-BAY-01-1	381	35
SLOT-02	OCCUPIED	SN-IFA128-BAY-01-2	382	35
SLOT-03	AVAILABLE	SN-IFA128-BAY-01-3	383	35
SLOT-04	AVAILABLE	SN-IFA128-BAY-01-4	384	35
SLOT-05	AVAILABLE	SN-IFA128-BAY-01-5	385	35
SLOT-01	OCCUPIED	SN-IFA128-BAY-02-1	386	36
SLOT-02	AVAILABLE	SN-IFA128-BAY-02-2	387	36
SLOT-03	OCCUPIED	SN-IFA128-BAY-02-3	388	36
SLOT-04	AVAILABLE	SN-IFA128-BAY-02-4	389	36
SLOT-05	AVAILABLE	SN-IFA128-BAY-02-5	390	36
SLOT-01	AVAILABLE	SN-KOS129-BAY-01-1	391	37
SLOT-02	OCCUPIED	SN-KOS129-BAY-01-2	392	37
SLOT-03	AVAILABLE	SN-KOS129-BAY-01-3	393	37
SLOT-04	AVAILABLE	SN-KOS129-BAY-01-4	394	37
SLOT-05	OCCUPIED	SN-KOS129-BAY-01-5	395	37
SLOT-01	AVAILABLE	SN-KOS129-BAY-02-1	396	38
SLOT-02	AVAILABLE	SN-KOS129-BAY-02-2	397	38
SLOT-03	AVAILABLE	SN-KOS129-BAY-02-3	398	38
SLOT-04	AVAILABLE	SN-KOS129-BAY-02-4	399	38
SLOT-05	AVAILABLE	SN-KOS129-BAY-02-5	400	38
SLOT-01	OCCUPIED	SN-OJO130-BAY-01-1	401	39
SLOT-02	AVAILABLE	SN-OJO130-BAY-01-2	402	39
SLOT-03	AVAILABLE	SN-OJO130-BAY-01-3	403	39
SLOT-04	AVAILABLE	SN-OJO130-BAY-01-4	404	39
SLOT-05	AVAILABLE	SN-OJO130-BAY-01-5	405	39
SLOT-01	AVAILABLE	SN-OJO130-BAY-02-1	406	40
SLOT-02	OCCUPIED	SN-OJO130-BAY-02-2	407	40
SLOT-03	AVAILABLE	SN-OJO130-BAY-02-3	408	40
SLOT-04	OCCUPIED	SN-OJO130-BAY-02-4	409	40
SLOT-05	AVAILABLE	SN-OJO130-BAY-02-5	410	40
SLOT-01	AVAILABLE	SN-SHO131-BAY-01-1	411	41
SLOT-02	OCCUPIED	SN-SHO131-BAY-01-2	412	41
SLOT-03	AVAILABLE	SN-SHO131-BAY-01-3	413	41
SLOT-04	AVAILABLE	SN-SHO131-BAY-01-4	414	41
SLOT-05	AVAILABLE	SN-SHO131-BAY-01-5	415	41
SLOT-01	AVAILABLE	SN-SHO131-BAY-02-1	416	42
SLOT-02	AVAILABLE	SN-SHO131-BAY-02-2	417	42
SLOT-03	AVAILABLE	SN-SHO131-BAY-02-3	418	42
SLOT-04	AVAILABLE	SN-SHO131-BAY-02-4	419	42
SLOT-05	AVAILABLE	SN-SHO131-BAY-02-5	420	42


--
-- Data for Name: parking_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_tickets (transaction_ref, channel, amount_paid, duration_hours, start_time, expiry_time, checkout_time, status, payment_method, created_at, id, customer_id, vehicle_id, bay_id, slot_id, agent_id) FROM stdin;
TXN-IG4XPJOK	MOBILE_APP	400.00	2	2026-02-07 12:37:51.135	2026-02-07 14:37:51.135	\N	EXPIRED	WALLET	2026-02-07 13:37:51.137	1	1	1	1	\N	\N
TXN-GPNUPIMU	MOBILE_APP	400.00	2	2026-02-07 11:37:51.144	2026-02-07 13:37:51.144	\N	ACTIVE	WALLET	2026-02-07 13:37:51.144	2	2	2	2	\N	\N
TXN-W91QR0OI	MOBILE_APP	400.00	2	2026-02-07 10:37:51.15	2026-02-07 12:37:51.15	\N	ACTIVE	WALLET	2026-02-07 13:37:51.151	3	3	3	3	\N	\N
TXN-AE8532YE	MOBILE_APP	400.00	2	2026-02-07 09:37:51.154	2026-02-07 11:37:51.154	\N	ACTIVE	WALLET	2026-02-07 13:37:51.154	4	1	4	4	\N	\N
TXN-1G0U2B48	MOBILE_APP	400.00	2	2026-02-07 08:37:51.157	2026-02-07 10:37:51.157	\N	ACTIVE	WALLET	2026-02-07 13:37:51.158	5	2	5	5	\N	\N
TXN-UJZ8E2WA	MOBILE_APP	400.00	2	2026-02-07 07:37:51.16	2026-02-07 09:37:51.16	\N	EXPIRED	WALLET	2026-02-07 13:37:51.16	6	3	1	6	\N	\N
TXN-AP8XNHNI	MOBILE_APP	400.00	2	2026-02-07 06:37:51.167	2026-02-07 08:37:51.167	\N	ACTIVE	WALLET	2026-02-07 13:37:51.167	7	1	2	7	\N	\N
TXN-U7QNMTH5	MOBILE_APP	400.00	2	2026-02-07 05:37:51.17	2026-02-07 07:37:51.17	\N	ACTIVE	WALLET	2026-02-07 13:37:51.171	8	2	3	8	\N	\N
TXN-Y5TLQWW4	MOBILE_APP	400.00	2	2026-02-07 04:37:51.173	2026-02-07 06:37:51.173	\N	ACTIVE	WALLET	2026-02-07 13:37:51.174	9	3	4	9	\N	\N
TXN-ZXWTIONP	MOBILE_APP	400.00	2	2026-02-07 03:37:51.176	2026-02-07 05:37:51.176	\N	ACTIVE	WALLET	2026-02-07 13:37:51.176	10	1	5	10	\N	\N
TXN-YWWS94PO	MOBILE_APP	400.00	2	2026-02-07 02:37:51.181	2026-02-07 04:37:51.181	\N	EXPIRED	WALLET	2026-02-07 13:37:51.182	11	2	1	11	\N	\N
TXN-23RBQV8M	MOBILE_APP	400.00	2	2026-02-07 01:37:51.185	2026-02-07 03:37:51.185	\N	ACTIVE	WALLET	2026-02-07 13:37:51.186	12	3	2	12	\N	\N
TXN-MOGBI28F	MOBILE_APP	400.00	2	2026-02-07 12:37:51.188	2026-02-07 14:37:51.188	\N	ACTIVE	WALLET	2026-02-07 13:37:51.188	13	1	3	13	\N	\N
TXN-7Y3QBNU2	MOBILE_APP	400.00	2	2026-02-07 11:37:51.19	2026-02-07 13:37:51.19	\N	ACTIVE	WALLET	2026-02-07 13:37:51.191	14	2	4	14	\N	\N
TXN-52OPDW8N	MOBILE_APP	400.00	2	2026-02-07 10:37:51.193	2026-02-07 12:37:51.193	\N	ACTIVE	WALLET	2026-02-07 13:37:51.194	15	3	5	15	\N	\N
TXN-3H1SLBF0	MOBILE_APP	400.00	2	2026-02-07 09:37:51.197	2026-02-07 11:37:51.197	\N	EXPIRED	WALLET	2026-02-07 13:37:51.199	16	1	1	16	\N	\N
TXN-EXFBU69U	MOBILE_APP	400.00	2	2026-02-07 08:37:51.202	2026-02-07 10:37:51.202	\N	ACTIVE	WALLET	2026-02-07 13:37:51.202	17	2	2	17	\N	\N
TXN-X9U71DRE	MOBILE_APP	400.00	2	2026-02-07 07:37:51.204	2026-02-07 09:37:51.204	\N	ACTIVE	WALLET	2026-02-07 13:37:51.204	18	3	3	18	\N	\N
TXN-ADRB3FSB	MOBILE_APP	400.00	2	2026-02-07 06:37:51.206	2026-02-07 08:37:51.206	\N	ACTIVE	WALLET	2026-02-07 13:37:51.206	19	1	4	19	\N	\N
TXN-2YVYZ8YF	MOBILE_APP	400.00	2	2026-02-07 05:37:51.208	2026-02-07 07:37:51.208	\N	ACTIVE	WALLET	2026-02-07 13:37:51.209	20	2	5	20	\N	\N
TXN-CZXLSINE	MOBILE_APP	400.00	2	2026-02-07 04:37:51.212	2026-02-07 06:37:51.212	\N	EXPIRED	WALLET	2026-02-07 13:37:51.214	21	3	1	21	\N	\N
TXN-2E7G2VTI	MOBILE_APP	400.00	2	2026-02-07 03:37:51.218	2026-02-07 05:37:51.218	\N	ACTIVE	WALLET	2026-02-07 13:37:51.218	22	1	2	22	\N	\N
TXN-CQQMKKMI	MOBILE_APP	400.00	2	2026-02-07 02:37:51.22	2026-02-07 04:37:51.22	\N	ACTIVE	WALLET	2026-02-07 13:37:51.221	23	2	3	23	\N	\N
TXN-UMKGKIEP	MOBILE_APP	400.00	2	2026-02-07 01:37:51.223	2026-02-07 03:37:51.223	\N	ACTIVE	WALLET	2026-02-07 13:37:51.224	24	3	4	24	\N	\N
TXN-6NDT1QF3	MOBILE_APP	400.00	2	2026-02-07 12:37:51.226	2026-02-07 14:37:51.226	\N	ACTIVE	WALLET	2026-02-07 13:37:51.227	25	1	5	25	\N	\N
TXN-VAWBYIIZ	MOBILE_APP	400.00	2	2026-02-07 15:15:31.616	2026-02-07 17:15:31.616	\N	EXPIRED	WALLET	2026-02-07 16:15:31.619	26	1	1	1	\N	\N
TXN-ZHVHO2H9	MOBILE_APP	400.00	2	2026-02-07 14:15:31.626	2026-02-07 16:15:31.626	\N	ACTIVE	WALLET	2026-02-07 16:15:31.627	27	2	2	2	\N	\N
TXN-JMA6IXPV	MOBILE_APP	400.00	2	2026-02-07 13:15:31.629	2026-02-07 15:15:31.629	\N	ACTIVE	WALLET	2026-02-07 16:15:31.63	28	3	3	3	\N	\N
TXN-LEU16U7K	MOBILE_APP	400.00	2	2026-02-07 12:15:31.632	2026-02-07 14:15:31.632	\N	ACTIVE	WALLET	2026-02-07 16:15:31.633	29	1	4	4	\N	\N
TXN-HVFUE4T7	MOBILE_APP	400.00	2	2026-02-07 11:15:31.637	2026-02-07 13:15:31.637	\N	ACTIVE	WALLET	2026-02-07 16:15:31.637	30	2	5	5	\N	\N
TXN-5BDF34RJ	MOBILE_APP	400.00	2	2026-02-07 10:15:31.64	2026-02-07 12:15:31.64	\N	EXPIRED	WALLET	2026-02-07 16:15:31.641	31	3	1	6	\N	\N
TXN-VRLDYXF3	MOBILE_APP	400.00	2	2026-02-07 09:15:31.643	2026-02-07 11:15:31.643	\N	ACTIVE	WALLET	2026-02-07 16:15:31.643	32	1	2	7	\N	\N
TXN-UNRUUA1L	MOBILE_APP	400.00	2	2026-02-07 08:15:31.645	2026-02-07 10:15:31.645	\N	ACTIVE	WALLET	2026-02-07 16:15:31.646	33	2	3	8	\N	\N
TXN-BE2AA9AS	MOBILE_APP	400.00	2	2026-02-07 07:15:31.647	2026-02-07 09:15:31.647	\N	ACTIVE	WALLET	2026-02-07 16:15:31.648	34	3	4	9	\N	\N
TXN-DYYLZ2Y7	MOBILE_APP	400.00	2	2026-02-07 06:15:31.652	2026-02-07 08:15:31.652	\N	ACTIVE	WALLET	2026-02-07 16:15:31.653	35	1	5	10	\N	\N
TXN-9FVJAME6	MOBILE_APP	400.00	2	2026-02-07 05:15:31.656	2026-02-07 07:15:31.656	\N	EXPIRED	WALLET	2026-02-07 16:15:31.656	36	2	1	11	\N	\N
TXN-GWBTOH96	MOBILE_APP	400.00	2	2026-02-07 04:15:31.658	2026-02-07 06:15:31.658	\N	ACTIVE	WALLET	2026-02-07 16:15:31.659	37	3	2	12	\N	\N
TXN-2PKLNLPC	MOBILE_APP	400.00	2	2026-02-07 15:15:31.66	2026-02-07 17:15:31.66	\N	ACTIVE	WALLET	2026-02-07 16:15:31.661	38	1	3	13	\N	\N
TXN-UYLYEEIC	MOBILE_APP	400.00	2	2026-02-07 14:15:31.663	2026-02-07 16:15:31.663	\N	ACTIVE	WALLET	2026-02-07 16:15:31.664	39	2	4	14	\N	\N
TXN-0XWNBJ71	MOBILE_APP	400.00	2	2026-02-07 13:15:31.666	2026-02-07 15:15:31.666	\N	ACTIVE	WALLET	2026-02-07 16:15:31.667	40	3	5	15	\N	\N
TXN-3IGS0E44	MOBILE_APP	400.00	2	2026-02-07 12:15:31.672	2026-02-07 14:15:31.672	\N	EXPIRED	WALLET	2026-02-07 16:15:31.672	41	1	1	16	\N	\N
TXN-92WZ4WWU	MOBILE_APP	400.00	2	2026-02-07 11:15:31.675	2026-02-07 13:15:31.675	\N	ACTIVE	WALLET	2026-02-07 16:15:31.675	42	2	2	17	\N	\N
TXN-XF9UEFOS	MOBILE_APP	400.00	2	2026-02-07 10:15:31.677	2026-02-07 12:15:31.677	\N	ACTIVE	WALLET	2026-02-07 16:15:31.678	43	3	3	18	\N	\N
TXN-PHNKZC6O	MOBILE_APP	400.00	2	2026-02-07 09:15:31.679	2026-02-07 11:15:31.679	\N	ACTIVE	WALLET	2026-02-07 16:15:31.68	44	1	4	19	\N	\N
TXN-1E94IQ87	MOBILE_APP	400.00	2	2026-02-07 08:15:31.682	2026-02-07 10:15:31.682	\N	ACTIVE	WALLET	2026-02-07 16:15:31.682	45	2	5	20	\N	\N
TXN-8OHL2O35	MOBILE_APP	400.00	2	2026-02-07 07:15:31.687	2026-02-07 09:15:31.687	\N	EXPIRED	WALLET	2026-02-07 16:15:31.688	46	3	1	21	\N	\N
TXN-BHANEM2Q	MOBILE_APP	400.00	2	2026-02-07 06:15:31.69	2026-02-07 08:15:31.69	\N	ACTIVE	WALLET	2026-02-07 16:15:31.691	47	1	2	22	\N	\N
TXN-V41PCD0T	MOBILE_APP	400.00	2	2026-02-07 05:15:31.693	2026-02-07 07:15:31.693	\N	ACTIVE	WALLET	2026-02-07 16:15:31.694	48	2	3	23	\N	\N
TXN-JJGB9G3Z	MOBILE_APP	400.00	2	2026-02-07 04:15:31.696	2026-02-07 06:15:31.696	\N	ACTIVE	WALLET	2026-02-07 16:15:31.696	49	3	4	24	\N	\N
TXN-YTG8XI4U	MOBILE_APP	400.00	2	2026-02-07 15:15:31.698	2026-02-07 17:15:31.698	\N	ACTIVE	WALLET	2026-02-07 16:15:31.698	50	1	5	25	\N	\N


--
-- Data for Name: parking_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_zones (zone_code, zone_name, geographical_area, id) FROM stdin;
IKJ111	Ikeja	\N	1
AGE112	Agege	\N	2
ALI113	Alimosho	\N	3
LAS114	Lagos Island	\N	4
LMN115	Lagos Mainland	\N	5
MSN116	Mushin	\N	6
OSS118	Oshodi-Isolo	\N	7
APA119	Apapa	\N	8
SUR120	Surulere	\N	9
EOS121	Eti-Osa	\N	10
VIB122	Victoria Island	\N	11
IKD112	Ikorodu	\N	12
AJI123	Ajeromi-Ifelodun	\N	13
AMO124	Amuwo-Odofin	\N	14
BAD125	Badagry	\N	15
EPE126	Epe	\N	16
IBL127	Ibeju-Lekki	\N	17
IFA128	Ifako-Ijaiye	\N	18
KOS129	Kosofe	\N	19
OJO130	Ojo	\N	20
SHO131	Shomolu	\N	21


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_resets (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
cmle1gjsv000350v2gqnsbjqv	5	2da00de214955341d5bb5cf44431463a428e158c5c42bce614c1ec45b8e1b66f	2026-02-08 18:50:17.381	2026-02-08 17:55:09.908	2026-02-08 17:50:17.407


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receipts (receipt_number, generated_at, pdf_url, id, ticket_id) FROM stdin;
REC-IG4XPJOK	2026-02-07 13:37:51.141	https://storage.laspa.gov.ng/receipts/1.pdf	1	1
REC-GPNUPIMU	2026-02-07 13:37:51.149	https://storage.laspa.gov.ng/receipts/2.pdf	2	2
REC-W91QR0OI	2026-02-07 13:37:51.153	https://storage.laspa.gov.ng/receipts/3.pdf	3	3
REC-AE8532YE	2026-02-07 13:37:51.156	https://storage.laspa.gov.ng/receipts/4.pdf	4	4
REC-1G0U2B48	2026-02-07 13:37:51.159	https://storage.laspa.gov.ng/receipts/5.pdf	5	5
REC-UJZ8E2WA	2026-02-07 13:37:51.165	https://storage.laspa.gov.ng/receipts/6.pdf	6	6
REC-AP8XNHNI	2026-02-07 13:37:51.169	https://storage.laspa.gov.ng/receipts/7.pdf	7	7
REC-U7QNMTH5	2026-02-07 13:37:51.172	https://storage.laspa.gov.ng/receipts/8.pdf	8	8
REC-Y5TLQWW4	2026-02-07 13:37:51.175	https://storage.laspa.gov.ng/receipts/9.pdf	9	9
REC-ZXWTIONP	2026-02-07 13:37:51.178	https://storage.laspa.gov.ng/receipts/10.pdf	10	10
REC-YWWS94PO	2026-02-07 13:37:51.184	https://storage.laspa.gov.ng/receipts/11.pdf	11	11
REC-23RBQV8M	2026-02-07 13:37:51.187	https://storage.laspa.gov.ng/receipts/12.pdf	12	12
REC-MOGBI28F	2026-02-07 13:37:51.19	https://storage.laspa.gov.ng/receipts/13.pdf	13	13
REC-7Y3QBNU2	2026-02-07 13:37:51.192	https://storage.laspa.gov.ng/receipts/14.pdf	14	14
REC-52OPDW8N	2026-02-07 13:37:51.195	https://storage.laspa.gov.ng/receipts/15.pdf	15	15
REC-3H1SLBF0	2026-02-07 13:37:51.201	https://storage.laspa.gov.ng/receipts/16.pdf	16	16
REC-EXFBU69U	2026-02-07 13:37:51.203	https://storage.laspa.gov.ng/receipts/17.pdf	17	17
REC-X9U71DRE	2026-02-07 13:37:51.205	https://storage.laspa.gov.ng/receipts/18.pdf	18	18
REC-ADRB3FSB	2026-02-07 13:37:51.207	https://storage.laspa.gov.ng/receipts/19.pdf	19	19
REC-2YVYZ8YF	2026-02-07 13:37:51.211	https://storage.laspa.gov.ng/receipts/20.pdf	20	20
REC-CZXLSINE	2026-02-07 13:37:51.217	https://storage.laspa.gov.ng/receipts/21.pdf	21	21
REC-2E7G2VTI	2026-02-07 13:37:51.22	https://storage.laspa.gov.ng/receipts/22.pdf	22	22
REC-CQQMKKMI	2026-02-07 13:37:51.222	https://storage.laspa.gov.ng/receipts/23.pdf	23	23
REC-UMKGKIEP	2026-02-07 13:37:51.225	https://storage.laspa.gov.ng/receipts/24.pdf	24	24
REC-6NDT1QF3	2026-02-07 13:37:51.228	https://storage.laspa.gov.ng/receipts/25.pdf	25	25
REC-VAWBYIIZ	2026-02-07 16:15:31.624	https://storage.laspa.gov.ng/receipts/26.pdf	26	26
REC-ZHVHO2H9	2026-02-07 16:15:31.628	https://storage.laspa.gov.ng/receipts/27.pdf	27	27
REC-JMA6IXPV	2026-02-07 16:15:31.631	https://storage.laspa.gov.ng/receipts/28.pdf	28	28
REC-LEU16U7K	2026-02-07 16:15:31.636	https://storage.laspa.gov.ng/receipts/29.pdf	29	29
REC-HVFUE4T7	2026-02-07 16:15:31.639	https://storage.laspa.gov.ng/receipts/30.pdf	30	30
REC-5BDF34RJ	2026-02-07 16:15:31.642	https://storage.laspa.gov.ng/receipts/31.pdf	31	31
REC-VRLDYXF3	2026-02-07 16:15:31.645	https://storage.laspa.gov.ng/receipts/32.pdf	32	32
REC-UNRUUA1L	2026-02-07 16:15:31.647	https://storage.laspa.gov.ng/receipts/33.pdf	33	33
REC-BE2AA9AS	2026-02-07 16:15:31.649	https://storage.laspa.gov.ng/receipts/34.pdf	34	34
REC-DYYLZ2Y7	2026-02-07 16:15:31.655	https://storage.laspa.gov.ng/receipts/35.pdf	35	35
REC-9FVJAME6	2026-02-07 16:15:31.658	https://storage.laspa.gov.ng/receipts/36.pdf	36	36
REC-GWBTOH96	2026-02-07 16:15:31.66	https://storage.laspa.gov.ng/receipts/37.pdf	37	37
REC-2PKLNLPC	2026-02-07 16:15:31.662	https://storage.laspa.gov.ng/receipts/38.pdf	38	38
REC-UYLYEEIC	2026-02-07 16:15:31.665	https://storage.laspa.gov.ng/receipts/39.pdf	39	39
REC-0XWNBJ71	2026-02-07 16:15:31.671	https://storage.laspa.gov.ng/receipts/40.pdf	40	40
REC-3IGS0E44	2026-02-07 16:15:31.674	https://storage.laspa.gov.ng/receipts/41.pdf	41	41
REC-92WZ4WWU	2026-02-07 16:15:31.677	https://storage.laspa.gov.ng/receipts/42.pdf	42	42
REC-XF9UEFOS	2026-02-07 16:15:31.679	https://storage.laspa.gov.ng/receipts/43.pdf	43	43
REC-PHNKZC6O	2026-02-07 16:15:31.681	https://storage.laspa.gov.ng/receipts/44.pdf	44	44
REC-1E94IQ87	2026-02-07 16:15:31.686	https://storage.laspa.gov.ng/receipts/45.pdf	45	45
REC-8OHL2O35	2026-02-07 16:15:31.689	https://storage.laspa.gov.ng/receipts/46.pdf	46	46
REC-BHANEM2Q	2026-02-07 16:15:31.692	https://storage.laspa.gov.ng/receipts/47.pdf	47	47
REC-V41PCD0T	2026-02-07 16:15:31.695	https://storage.laspa.gov.ng/receipts/48.pdf	48	48
REC-JJGB9G3Z	2026-02-07 16:15:31.697	https://storage.laspa.gov.ng/receipts/49.pdf	49	49
REC-YTG8XI4U	2026-02-07 16:15:31.699	https://storage.laspa.gov.ng/receipts/50.pdf	50	50


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at, revoked_at) FROM stdin;
cmlckzdkf0001rgv2fsht4qxh	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDQ4NDg3NiwiZXhwIjoxNzcxMDg5Njc2fQ.kLd_fCs8qN5tSqFdElDfW0IrQ4336iFCXwElDtHxp-c	2026-02-14 17:21:16.141	2026-02-07 17:21:16.143	\N
cmlcoxzd40001s4v2nytgw9ru	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDQ5MTUyOSwiZXhwIjoxNzcxMDk2MzI5fQ.NAbprz_vPDDlEXHHjbfXv_l-RFeiB5Spz9GIzqL9aqQ	2026-02-14 19:12:09.542	2026-02-07 19:12:09.544	\N
cmlcp34xs0003s4v2x3dgbqgy	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDQ5MTc3MCwiZXhwIjoxNzcxMDk2NTcwfQ.B9yMtzIde7u1i_BJs8RStI6pOm5NKoBJEgcStF1aQbE	2026-02-14 19:16:10.046	2026-02-07 19:16:10.048	\N
cmldva8ts00015ov2jfso82jg	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDU2MjY0NSwiZXhwIjoxNzcxMTY3NDQ1fQ.nPp0lZEFpwihlv3pdVolq0b_VDTkq1qlWj3VS4WDWu8	2026-02-15 14:57:25.549	2026-02-08 14:57:25.552	\N
cmle0qgor000250v24kq7bllw	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDU3MTgwMCwiZXhwIjoxNzcxMTc2NjAwfQ.LchI_7L237SFYiCustakop1vvtEf2hcMhF4ljCDIboc	2026-02-15 17:30:00.311	2026-02-08 17:30:00.315	\N
cmle1nd0w000550v2ltt7wtrq	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDU3MzMzNSwiZXhwIjoxNzcxMTc4MTM1fQ.Ky5Rfi24QZv0yFp4AnpF8IWIg8fMMUVMz_-4euNHEa0	2026-02-15 17:55:35.214	2026-02-08 17:55:35.216	\N
cmle1ys06000750v23wpl16sl	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc3MDU3Mzg2NywiZXhwIjoxNzcxMTc4NjY3fQ.bdPebY70blvE1uITyurzx0uuAgGqe-SqDDa8cpjDOvg	2026-02-15 18:04:27.846	2026-02-08 18:04:27.846	\N
cmle21fao000950v2sdnuxld7	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc3MDU3Mzk5MSwiZXhwIjoxNzcxMTc4NzkxfQ.iVJce4zujccqq-w61emq3fcT2UseCdoRftvIRJM2FZM	2026-02-15 18:06:31.342	2026-02-08 18:06:31.343	\N
cmle5i7ls0001kkv2vssth8uo	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc3MDU3OTgxMywiZXhwIjoxNzcxMTg0NjEzfQ.kNj40bI70VJe9VdGvaBJ2l7Kay9E_tnbmH6GpoAvRQg	2026-02-15 19:43:33.373	2026-02-08 19:43:33.376	\N


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, token, expires_at, created_at) FROM stdin;
cmlckzdjh0000rgv2mgrmdzh6	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA0ODQ4NzYsImV4cCI6MTc3MDQ4NTc3Nn0.iGYLc5KH6NJ8paM4lp2CCouowdXWpOLVF1vWiq9V-t4	2026-02-07 17:36:16.06	2026-02-07 17:21:16.106
cmlcoxzcl0000s4v2mwry9n8m	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA0OTE1MjksImV4cCI6MTc3MDQ5MjQyOX0.QZXcOoJz293CP5DuKD5jVY8D05WHm-acVuaBIwZBjOM	2026-02-07 19:27:09.486	2026-02-07 19:12:09.524
cmlcp34xb0002s4v25nc75lkt	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA0OTE3NzAsImV4cCI6MTc3MDQ5MjY3MH0.qKz8ryQ34Pl6_ZxAxWUsjhI06-LeNmwvdZ5UH1IIk34	2026-02-07 19:31:10.026	2026-02-07 19:16:10.031
cmldva8t700005ov2selpgswh	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA1NjI2NDUsImV4cCI6MTc3MDU2MzU0NX0.Yp9nJqIm0wnqNQ13VOBnV7U5zjeim4jcJstsEbguiMs	2026-02-08 15:12:25.468	2026-02-08 14:57:25.529
cmle0qgod000150v23u2kmsnk	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MDU3MTgwMCwiZXhwIjoxNzcwNTcyNzAwfQ._DnLxDsLFXGDL4GQkxJ0Jo3fa8lmUDnC3Nipiqtb2M0	2026-02-08 17:45:00.296	2026-02-08 17:30:00.301
cmle1nd0g000450v2c7msr4p1	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MDU3MzMzNSwiZXhwIjoxNzcwNTc0MjM1fQ.vISaWZM-hpuQ6-AubUSafS9MBB-yeKQu4DE8lvj8lWI	2026-02-08 18:10:35.199	2026-02-08 17:55:35.2
cmle1yrzr000650v2y99y2cu9	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoidmlld2VyQGxhc3BhLmdvdi5uZyIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA1NzM4NjcsImV4cCI6MTc3MDU3NDc2N30.XU8mtr1kcINLqt_3OGa3j3FEVbDlKWJdLjLR2ZX5e1U	2026-02-08 18:19:27.83	2026-02-08 18:04:27.831
cmle21fa4000850v2q60jexi4	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoidmlld2VyQGxhc3BhLmdvdi5uZyIsInJvbGUiOiJWSUVXRVIiLCJpYXQiOjE3NzA1NzM5OTEsImV4cCI6MTc3MDU3NDg5MX0.dvL8OO02NNoZGeAnDZbVVqbs8BkK_unB_1IAxoS8Ml4	2026-02-08 18:21:31.317	2026-02-08 18:06:31.324
cmle5i7lb0000kkv2u5h0kxt6	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibnpvdGFlbW1hbnVlbDE2QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MDU3OTgxMywiZXhwIjoxNzcwNTgwNzEzfQ.JTXGVICW-25QQM0dnUKZsf7gFIFAC4t_lCeMY7L-Qhc	2026-02-08 19:58:33.328	2026-02-08 19:43:33.359


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, first_name, last_name, email, phone_number, role, account_status, created_at, updated_at) FROM stdin;
1	System	Admin	admin@laspa.lagos.gov.ng	+2348045528147	ADMIN	ACTIVE	2026-02-07 13:37:50.345	2026-02-07 13:37:50.345
2	Parking	Agent	agent@laspa.lagos.gov.ng	+2348060243377	PARKING_AGENT	ACTIVE	2026-02-07 13:37:50.46	2026-02-07 13:37:50.46
3	Ade	Olawale	officer.ade@laspa.lagos.gov.ng	+2348054712913	ENFORCEMENT_AGENT	ACTIVE	2026-02-07 13:37:50.469	2026-02-07 13:37:50.469
4	Chidi	Nnamdi	officer.chi@laspa.lagos.gov.ng	+2348034612740	ENFORCEMENT_AGENT	ACTIVE	2026-02-07 13:37:50.474	2026-02-07 13:37:50.474


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, first_name, last_name, role, is_active, last_active_at, created_at, updated_at) FROM stdin;
1	admin@laspa.gov.ng	$2b$10$zABeX8oZo0McJD/tFEmn3OsxyCq5zL16jGmtrYe8knq3Nu6g7WBlO	System	Administrator	ADMIN	t	\N	2026-02-07 16:15:30.493	2026-02-07 16:15:30.493
2	officer@laspa.gov.ng	$2b$10$5kzLR8UTPSABt2crSQKj4u06BrCzjdENyIbA8m.ljFxekw1udB7Ty	John	Officer	ENFORCEMENT_OFFICER	t	\N	2026-02-07 16:15:30.613	2026-02-07 16:15:30.613
3	analyst@laspa.gov.ng	$2b$10$5zVVqfTbq.FpszK4uDyaduobO3Li3Qxlw1EMGKX6R1Ee5aGRoqWFO	Jane	Analyst	ANALYST	t	\N	2026-02-07 16:15:30.705	2026-02-07 16:15:30.705
4	viewer@laspa.gov.ng	$2b$10$W1nWgAV11g3xhHFtS1R14u6IFSzL4OcPRPjd9tFzLUP3QKUCdhxM6	View	Only	VIEWER	t	2026-02-08 18:06:31.348	2026-02-07 16:15:30.792	2026-02-08 18:06:31.35
5	nzotaemmanuel16@gmail.com	$2b$10$YsYr9kpGar764k2.qnw1w.mw.HnZRuYSbUYh7YVy/BOtV.UXgFfpK	Emmanuel	Nzota	ADMIN	t	2026-02-08 19:43:33.384	2026-02-07 17:19:22.044	2026-02-08 19:43:33.399


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (plate_number, plate_code, plate_source, plate_type, is_default, created_at, updated_at, customer_id, id) FROM stdin;
KJA-101-AA	KJA	Lagos	Private	t	2026-02-07 13:37:50.505	2026-02-07 13:37:50.505	1	1
LND-202-XY	LND	Lagos	Private	t	2026-02-07 13:37:50.518	2026-02-07 13:37:50.518	2	2
IKD-303-ZZ	IKD	Lagos	Private	t	2026-02-07 13:37:50.525	2026-02-07 13:37:50.525	3	3
APP-404-BC	APP	Lagos	Private	f	2026-02-07 13:37:50.535	2026-02-07 13:37:50.535	1	4
MUS-505-DE	MUS	Lagos	Private	f	2026-02-07 13:37:50.54	2026-02-07 13:37:50.54	2	5


--
-- Data for Name: violation_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.violation_types (code, description, default_fee, severity_level, id) FROM stdin;
PV01	Illegal Parking	25000.00	2	1
PHD01	Handicap Spot Violation	50000.00	2	2
PFL00	Fire Lane Obstruction	100000.00	5	3


--
-- Name: appeals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appeals_id_seq', 6, true);


--
-- Name: customer_violations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_violations_id_seq', 30, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- Name: enforcement_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.enforcement_actions_id_seq', 6, true);


--
-- Name: fines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fines_id_seq', 30, true);


--
-- Name: parking_bays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_bays_id_seq', 42, true);


--
-- Name: parking_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_requests_id_seq', 40, true);


--
-- Name: parking_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_slots_id_seq', 420, true);


--
-- Name: parking_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_tickets_id_seq', 50, true);


--
-- Name: parking_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_zones_id_seq', 21, true);


--
-- Name: receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.receipts_id_seq', 50, true);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 5, true);


--
-- Name: violation_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.violation_types_id_seq', 3, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: appeals appeals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_pkey PRIMARY KEY (id);


--
-- Name: customer_violations customer_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: enforcement_actions enforcement_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_actions
    ADD CONSTRAINT enforcement_actions_pkey PRIMARY KEY (id);


--
-- Name: fines fines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_pkey PRIMARY KEY (id);


--
-- Name: parking_bays parking_bays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_bays
    ADD CONSTRAINT parking_bays_pkey PRIMARY KEY (id);


--
-- Name: parking_requests parking_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: parking_tickets parking_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_pkey PRIMARY KEY (id);


--
-- Name: parking_zones parking_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_zones
    ADD CONSTRAINT parking_zones_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: violation_types violation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.violation_types
    ADD CONSTRAINT violation_types_pkey PRIMARY KEY (id);


--
-- Name: customer_violations_reference_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customer_violations_reference_id_key ON public.customer_violations USING btree (reference_id);


--
-- Name: customers_customer_reference_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_customer_reference_id_key ON public.customers USING btree (customer_reference_id);


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: enforcement_actions_reference_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX enforcement_actions_reference_id_key ON public.enforcement_actions USING btree (reference_id);


--
-- Name: parking_bays_bay_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parking_bays_bay_code_key ON public.parking_bays USING btree (bay_code);


--
-- Name: parking_tickets_transaction_ref_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parking_tickets_transaction_ref_key ON public.parking_tickets USING btree (transaction_ref);


--
-- Name: parking_zones_zone_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parking_zones_zone_code_key ON public.parking_zones USING btree (zone_code);


--
-- Name: password_resets_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX password_resets_token_key ON public.password_resets USING btree (token);


--
-- Name: receipts_receipt_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX receipts_receipt_number_key ON public.receipts USING btree (receipt_number);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: staff_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX staff_email_key ON public.staff USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: vehicles_plate_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vehicles_plate_number_key ON public.vehicles USING btree (plate_number);


--
-- Name: violation_types_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX violation_types_code_key ON public.violation_types USING btree (code);


--
-- Name: appeals appeals_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appeals appeals_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appeals appeals_violation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.customer_violations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_violations customer_violations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_violations customer_violations_enforcement_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_enforcement_officer_id_fkey FOREIGN KEY (enforcement_officer_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_violations customer_violations_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.parking_tickets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_violations customer_violations_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_violations customer_violations_violation_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_violation_type_id_fkey FOREIGN KEY (violation_type_id) REFERENCES public.violation_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_violations customer_violations_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_violations
    ADD CONSTRAINT customer_violations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.parking_zones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: enforcement_actions enforcement_actions_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_actions
    ADD CONSTRAINT enforcement_actions_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: enforcement_actions enforcement_actions_violation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_actions
    ADD CONSTRAINT enforcement_actions_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.customer_violations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fines fines_violation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.customer_violations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_bays parking_bays_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_bays
    ADD CONSTRAINT parking_bays_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.parking_zones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_requests parking_requests_bay_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_bay_id_fkey FOREIGN KEY (bay_id) REFERENCES public.parking_bays(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_requests parking_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_requests parking_requests_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.parking_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_requests parking_requests_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_requests parking_requests_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_requests
    ADD CONSTRAINT parking_requests_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.parking_zones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_slots parking_slots_bay_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_bay_id_fkey FOREIGN KEY (bay_id) REFERENCES public.parking_bays(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_tickets parking_tickets_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_tickets parking_tickets_bay_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_bay_id_fkey FOREIGN KEY (bay_id) REFERENCES public.parking_bays(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_tickets parking_tickets_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parking_tickets parking_tickets_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.parking_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_tickets parking_tickets_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_tickets
    ADD CONSTRAINT parking_tickets_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipts receipts_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.parking_tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vehicles vehicles_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


