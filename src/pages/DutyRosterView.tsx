import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Employee {
  id: string
  name: string
}

interface RosterAssignment {
  employee_id: string
  date: string
  shift_type: {
    code: string
  }
}

export default function DutyRosterView() {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [roster, setRoster] = useState<RosterAssignment[]>([])
  const [loading, setLoading] = useState(true)

  /* ------------------ Fetch Employees ------------------ */
  useEffect(() => {
    const loadEmployees = async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, name')
        .order('name')

      setEmployees(data || [])
      setSelectedEmployees(data?.map(e => e.id) || [])
    }

    loadEmployees()
  }, [])

  /* ------------------ Fetch Roster ------------------ */
  useEffect(() => {
    if (!fromDate || !toDate) return

    const loadRoster = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('roster_assignment')
        .select(`
          employee_id,
          date,
          shift_type:shift_type_id ( code )
        `)
        .gte('date', fromDate)
        .lte('date', toDate)
        .in('employee_id', selectedEmployees)

      if (!error) setRoster(data || [])
      setLoading(false)
    }

    loadRoster()
  }, [fromDate, toDate, selectedEmployees])

  /* ------------------ Date Columns ------------------ */
  const dates = useMemo(() => {
    if (!fromDate || !toDate) return []

    const start = new Date(fromDate)
    const end = new Date(toDate)
    const result: string[] = []

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      result.push(new Date(d).toISOString().split('T')[0])
    }

    return result
  }, [fromDate, toDate])

  /* ------------------ Helpers ------------------ */
  const getShift = (empId: string, date: string) => {
    return roster.find(
      r => r.employee_id === empId && r.date === date
    )?.shift_type?.code || '-'
  }

  if (loading && fromDate) {
    return <div className="p-6">Loading roster...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CalendarDays className="w-6 h-6" />
        Duty Roster
      </h1>

      {/* ------------------ Filters ------------------ */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          multiple
          value={selectedEmployees}
          onChange={e =>
            setSelectedEmployees(
              Array.from(e.target.selectedOptions, o => o.value)
            )
          }
          className="border p-2 rounded md:col-span-2"
        >
          <option value="" disabled>
            Select Employees (Ctrl + Click)
          </option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------ Roster Table ------------------ */}
      {dates.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Employee</th>
                {dates.map(d => (
                  <th key={d} className="border px-2 py-1 text-center text-sm">
                    {new Date(d).getDate()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {employees
                .filter(e => selectedEmployees.includes(e.id))
                .map(emp => (
                  <tr key={emp.id}>
                    <td className="border px-3 py-2 font-medium">
                      {emp.name}
                    </td>

                    {dates.map(d => (
                      <td
                        key={d}
                        className="border px-2 py-1 text-center text-sm"
                      >
                        {getShift(emp.id, d)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
