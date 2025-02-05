/*
  # Fix RLS Policies for Employee Attendance System

  1. Changes
    - Update RLS policies for employees table
    - Update RLS policies for attendance_records table
    - Add policies for public access during development

  2. Security
    - Enable RLS on both tables
    - Allow read/write access for authenticated users
    - Allow public access during development (should be removed in production)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON attendance_records;

-- Create policies for employees table
CREATE POLICY "Enable read for all users" ON employees
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users" ON employees
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON employees
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON employees
  FOR DELETE
  USING (true);

-- Create policies for attendance_records table
CREATE POLICY "Enable read for all users" ON attendance_records
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users" ON attendance_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON attendance_records
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON attendance_records
  FOR DELETE
  USING (true);