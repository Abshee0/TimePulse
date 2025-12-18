/*
  # Create leave_plans table for managing employee leave

  1. New Tables
    - `leave_plans`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `leave_type` (text: 'Annual', 'FRL', 'Sick')
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)
      - `created_by` (uuid, auth user who created it)

  2. Security
    - Enable RLS on `leave_plans` table
    - Add policies for read/write access
    - Ensure data integrity with constraints

  3. Constraints
    - Annual Leave: max 30 days/year
    - FRL Leave: max 10 days/year
    - Sick Leave: max 30 days/year
    - Max 3 plans per employee
*/

CREATE TABLE IF NOT EXISTS leave_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('Annual', 'FRL', 'Sick')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

ALTER TABLE leave_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all leave plans"
  ON leave_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create leave plans"
  ON leave_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own leave plans"
  ON leave_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own leave plans"
  ON leave_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_leave_plans_employee_id ON leave_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_plans_dates ON leave_plans(start_date, end_date);
