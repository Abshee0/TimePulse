/*
  # Fix date timezone handling for attendance records

  1. Changes
    - Drop existing trigger
    - Create new trigger to handle timezone conversion properly
    - Ensure dates are stored with proper timezone handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS handle_date_conversion_trigger ON attendance_records;
DROP FUNCTION IF EXISTS handle_date_conversion();

-- Create new function to handle date conversion
CREATE OR REPLACE FUNCTION handle_date_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert the date to UTC, then extract just the date part
    NEW.date = (NEW.date AT TIME ZONE 'UTC')::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for attendance_records
CREATE TRIGGER handle_date_conversion_trigger
    BEFORE INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_date_conversion();