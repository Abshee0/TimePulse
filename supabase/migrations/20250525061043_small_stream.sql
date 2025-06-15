/*
  # Database Schema for Attendance System

  1. Functions
    - Create/replace updated_at trigger function

  2. Tables
    - employees: Store employee information
    - attendance_records: Store attendance records with unique constraint per employee per date

  3. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    staff_id text NOT NULL UNIQUE,
    position text NOT NULL,
    department text NOT NULL,
    contact_number text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date date NOT NULL,
    duty_time text,
    in_time1 text,
    out_time1 text,
    in_time2 text,
    out_time2 text,
    in_time3 text,
    out_time3 text,
    medical boolean DEFAULT false,
    absent boolean DEFAULT false,
    remarks text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(employee_id, date)
);

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at') THEN
        CREATE TRIGGER update_employees_updated_at
            BEFORE UPDATE ON employees
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_attendance_records_updated_at') THEN
        CREATE TRIGGER update_attendance_records_updated_at
            BEFORE UPDATE ON attendance_records
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for employees
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Enable read for all users') THEN
        CREATE POLICY "Enable read for all users" ON employees
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Enable insert for all users') THEN
        CREATE POLICY "Enable insert for all users" ON employees
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Enable update for all users') THEN
        CREATE POLICY "Enable update for all users" ON employees
            FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Enable delete for all users') THEN
        CREATE POLICY "Enable delete for all users" ON employees
            FOR DELETE USING (true);
    END IF;
END $$;

-- Create policies for attendance_records
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance_records' AND policyname = 'Enable read for all users') THEN
        CREATE POLICY "Enable read for all users" ON attendance_records
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance_records' AND policyname = 'Enable insert for all users') THEN
        CREATE POLICY "Enable insert for all users" ON attendance_records
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance_records' AND policyname = 'Enable update for all users') THEN
        CREATE POLICY "Enable update for all users" ON attendance_records
            FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance_records' AND policyname = 'Enable delete for all users') THEN
        CREATE POLICY "Enable delete for all users" ON attendance_records
            FOR DELETE USING (true);
    END IF;
END $$;