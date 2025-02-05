/*
  # Employee Attendance System Schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `staff_id` (text, unique)
      - `position` (text)
      - `department` (text)
      - `contact_number` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `attendance_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `date` (date)
      - `duty_time` (text)
      - `in_time1` (text)
      - `out_time1` (text)
      - `in_time2` (text)
      - `out_time2` (text)
      - `in_time3` (text)
      - `out_time3` (text)
      - `medical` (boolean)
      - `absent` (boolean)
      - `remarks` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their organization's data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  staff_id TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duty_time TEXT,
  in_time1 TEXT,
  out_time1 TEXT,
  in_time2 TEXT,
  out_time2 TEXT,
  in_time3 TEXT,
  out_time3 TEXT,
  medical BOOLEAN DEFAULT false,
  absent BOOLEAN DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Enable all operations for authenticated users" ON employees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for attendance_records table
CREATE POLICY "Enable all operations for authenticated users" ON attendance_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();