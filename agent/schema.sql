-- DESIGN ONLY: not applied to a database. Review retention/access before activation.
-- PostgreSQL. All access is through an authenticated, authorized server.
BEGIN;
CREATE SCHEMA IF NOT EXISTS reception;
REVOKE ALL ON SCHEMA reception FROM PUBLIC;
CREATE TABLE reception.contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK(length(name) BETWEEN 3 AND 120),
 phone text NOT NULL,
 email text,
 kind text NOT NULL DEFAULT 'prospect' CHECK(kind IN ('prospect','patient')),
 patient_verified_by text,
 patient_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(kind <> 'patient' OR (patient_verified_by IS NOT NULL AND patient_verified_at IS NOT NULL))
);
-- No unique-phone assumption: families may share contact details.
CREATE TABLE reception.patient_access (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contact_id uuid NOT NULL REFERENCES reception.contacts(id),
 auth_subject text NOT NULL,
 linked_by_staff text NOT NULL,
 linked_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 UNIQUE(contact_id,auth_subject)
);
-- Identity is provided by an external authentication service, never by the LLM.
CREATE TABLE reception.consent_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contact_id uuid NOT NULL REFERENCES reception.contacts(id),
 purpose text NOT NULL CHECK(purpose IN ('appointment_contact','data_processing')),
 granted boolean NOT NULL,
 notice_version text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE reception.requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contact_id uuid NOT NULL REFERENCES reception.contacts(id),
 reason text NOT NULL CHECK(length(reason)<=1000),
 intent text NOT NULL CHECK(intent IN ('information','budget','valuation','existing_appointment','clinical_question','other')),
 availability_note text CHECK(length(availability_note)<=300),
 status text NOT NULL DEFAULT 'pending_review' CHECK(status IN ('pending_review','in_progress','resolved','withdrawn')),
 idempotency_key uuid UNIQUE NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE reception.appointments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contact_id uuid NOT NULL REFERENCES reception.contacts(id),
 external_event_id text UNIQUE,
 starts_at timestamptz NOT NULL,
 ends_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','completed')),
 approved_by text,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(ends_at>starts_at),
 CHECK(status <> 'confirmed' OR approved_by IS NOT NULL)
);
CREATE TABLE reception.identity_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contact_id uuid NOT NULL REFERENCES reception.contacts(id),
 private_object_key text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','deleted')),
 reviewed_by text,
 reviewed_at timestamptz,
 delete_after timestamptz NOT NULL,
 CHECK(status NOT IN ('approved','rejected') OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
-- Store private object keys, never public URLs or the identity document itself.
CREATE TABLE reception.staff_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL REFERENCES reception.requests(id),
 level text NOT NULL CHECK(level IN ('reception','jenny_review')),
 reason_code text NOT NULL,
 summary text NOT NULL CHECK(length(summary)<=1000),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','claimed','resolved')),
 assigned_to text,
 created_at timestamptz NOT NULL DEFAULT now(),
 resolved_at timestamptz
);
CREATE TABLE reception.audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_subject text NOT NULL,
 action text NOT NULL,
 entity_type text NOT NULL,
 entity_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reception.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.patient_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.identity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception.audit_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA reception FROM PUBLIC;
-- No permissive policies: access is denied until reviewed policies/roles exist.
-- Table owners and privileged service roles can bypass RLS: NEVER expose them
-- to the browser. Authorize every contact_id against patient_access server-side.
-- Booking conflicts need transactional locking/exclusion via the selected agenda.
-- No notifications, payment data or actual patient records are inserted here.
COMMIT;
