import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Copy, RotateCcw, CheckSquare, Square, CheckCircle, XCircle } from 'lucide-react';

const AssignmentScheduler = () => {
  const [people, setPeople] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(9); // September
  const [currentYear, setCurrentYear] = useState(2024);
  const [assignments, setAssignments] = useState({});
  const [history, setHistory] = useState({});
  const [newPersonName, setNewPersonName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [vidaMinisterio2Weeks, setVidaMinisterio2Weeks] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPeople = localStorage.getItem('assignmentPeople');
    const savedHistory = localStorage.getItem('assignmentHistory');
    const savedVidaMinisterio2 = localStorage.getItem('vidaMinisterio2Weeks');
    
    if (savedPeople) {
      try {
        setPeople(JSON.parse(savedPeople));
      } catch (e) {
        console.error('Error loading people:', e);
      }
    }
    
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    if (savedVidaMinisterio2) {
      try {
        setVidaMinisterio2Weeks(JSON.parse(savedVidaMinisterio2));
      } catch (e) {
        console.error('Error loading vida ministerio 2:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('assignmentPeople', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('assignmentHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('vidaMinisterio2Weeks', JSON.stringify(vidaMinisterio2Weeks));
  }, [vidaMinisterio2Weeks]);

  const roles = [
    'Presidente',
    'Oracion inicial',
    'Tesoros',
    'Perlas',
    'Vida y ministerio',
    'Vida y ministerio 2',
    'Estudio biblico',
    'Lector del libro',
    'Oracion final',
    'Acomodadores exterior',
    'Acomodadores interior'
  ];

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generate weeks for a month
  const generateWeeks = (month, year) => {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    while (startDate <= lastDay) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      // Check if this week has any days in the current month
      const weekHasCurrentMonth = (startDate.getMonth() + 1 === month && startDate.getFullYear() === year) ||
                                 (endDate.getMonth() + 1 === month && endDate.getFullYear() === year) ||
                                 (startDate < firstDay && endDate > lastDay);
      
      if (weekHasCurrentMonth) {
        weeks.push({
          start: new Date(startDate),
          end: new Date(endDate),
          key: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
        });
      }
      
      startDate.setDate(startDate.getDate() + 7);
    }
    
    return weeks;
  };

  const formatDateRange = (start, end) => {
    const startStr = `${start.getDate()}/${start.getMonth() + 1}`;
    const endStr = `${end.getDate()}/${end.getMonth() + 1}`;
    return `${startStr} - ${endStr}`;
  };

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson = {
        id: Date.now(),
        name: newPersonName.trim(),
        roles: {}
      };
      roles.forEach(role => {
        newPerson.roles[role] = false;
      });
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const addBulkPeople = () => {
    if (bulkNames.trim()) {
      const names = bulkNames.split('\n').filter(name => name.trim());
      const newPeople = names.map(name => ({
        id: Date.now() + Math.random(),
        name: name.trim(),
        roles: roles.reduce((acc, role) => ({ ...acc, [role]: false }), {})
      }));
      setPeople([...people, ...newPeople]);
      setBulkNames('');
      setShowBulkInput(false);
    }
  };

  const toggleRole = (personId, role) => {
    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, roles: { ...person.roles, [role]: !person.roles[role] } }
        : person
    ));
  };

  const toggleAllRoles = (personId, assign) => {
    setPeople(people.map(person => 
      person.id === personId 
        ? { 
            ...person, 
            roles: Object.keys(person.roles).reduce((acc, role) => {
              acc[role] = assign;
              return acc;
            }, {})
          }
        : person
    ));
  };

  const deletePerson = (personId) => {
    setPeople(people.filter(person => person.id !== personId));
  };

  const getPeopleForRole = (role) => {
    return people.filter(person => person.roles[role]);
  };

  const getNextPersonForRole = (role, weekKey, usedThisWeek = [], weekIndex = 0) => {
    const availablePeople = getPeopleForRole(role);
    
    if (availablePeople.length === 0) return null;

    // Filter out people already used this week
    const notUsedThisWeek = availablePeople.filter(person => 
      !usedThisWeek.includes(person.name)
    );

    if (notUsedThisWeek.length === 0) {
      console.warn(`Warning: All people for role ${role} are already used this week`);
      return null;
    }

    // Get history for this role
    const roleHistory = history[role] || [];
    
    // Create a rotation based on available people
    // This ensures different people each week even without much history
    const sortedPeople = notUsedThisWeek.sort((a, b) => a.name.localeCompare(b.name));
    
    // Find people who haven't been assigned this role recently
    const notRecentlyUsed = sortedPeople.filter(person => 
      !roleHistory.slice(-availablePeople.length).includes(person.name)
    );

    // If we have people who haven't been used recently, rotate through them
    if (notRecentlyUsed.length > 0) {
      return notRecentlyUsed[weekIndex % notRecentlyUsed.length];
    }

    // Otherwise, rotate through all available people
    return sortedPeople[weekIndex % sortedPeople.length];
  };

  const generateAssignments = () => {
    const weeks = generateWeeks(currentMonth, currentYear);
    const newAssignments = {};
    const newHistory = { ...history };

    weeks.forEach((week, weekIndex) => {
      const weekKey = week.key;
      const weekAssignments = {};
      const usedThisWeek = [];

      // Assign single roles
      const singleRoles = [
        'Presidente', 'Oracion inicial', 'Tesoros', 'Perlas', 
        'Vida y ministerio', 'Estudio biblico', 'Lector del libro', 'Oracion final'
      ];

      singleRoles.forEach(role => {
        const person = getNextPersonForRole(role, weekKey, usedThisWeek);
        if (person) {
          weekAssignments[role] = person.name;
          usedThisWeek.push(person.name);
          
          // Update history
          if (!newHistory[role]) newHistory[role] = [];
          newHistory[role].push(person.name);
          
          // Keep only recent history (last 2 months worth)
          if (newHistory[role].length > getPeopleForRole(role).length * 2) {
            newHistory[role] = newHistory[role].slice(-getPeopleForRole(role).length);
          }
        }
      });

      // Check if Vida y ministerio 2 should be assigned (you can add logic here)
      // For now, let's assign it every week
      const person2 = getNextPersonForRole('Vida y ministerio 2', weekKey, usedThisWeek);
      if (person2) {
        weekAssignments['Vida y ministerio 2'] = person2.name;
        usedThisWeek.push(person2.name);
        
        if (!newHistory['Vida y ministerio 2']) newHistory['Vida y ministerio 2'] = [];
        newHistory['Vida y ministerio 2'].push(person2.name);
        
        if (newHistory['Vida y ministerio 2'].length > getPeopleForRole('Vida y ministerio 2').length * 2) {
          newHistory['Vida y ministerio 2'] = newHistory['Vida y ministerio 2'].slice(-getPeopleForRole('Vida y ministerio 2').length);
        }
      }

      // Assign acomodadores exterior (3 people)
      const exteriorPeople = [];
      for (let i = 0; i < 3; i++) {
        const person = getNextPersonForRole('Acomodadores exterior', weekKey, [...usedThisWeek, ...exteriorPeople]);
        if (person) {
          exteriorPeople.push(person.name);
          usedThisWeek.push(person.name);
        }
      }
      if (exteriorPeople.length > 0) {
        weekAssignments['Acomodadores exterior'] = exteriorPeople;
        
        if (!newHistory['Acomodadores exterior']) newHistory['Acomodadores exterior'] = [];
        exteriorPeople.forEach(name => {
          newHistory['Acomodadores exterior'].push(name);
        });
        
        if (newHistory['Acomodadores exterior'].length > getPeopleForRole('Acomodadores exterior').length * 2) {
          newHistory['Acomodadores exterior'] = newHistory['Acomodadores exterior'].slice(-getPeopleForRole('Acomodadores exterior').length);
        }
      }

      // Assign acomodadores interior (2 people)
      const interiorPeople = [];
      for (let i = 0; i < 2; i++) {
        const person = getNextPersonForRole('Acomodadores interior', weekKey, [...usedThisWeek, ...interiorPeople]);
        if (person) {
          interiorPeople.push(person.name);
          usedThisWeek.push(person.name);
        }
      }
      if (interiorPeople.length > 0) {
        weekAssignments['Acomodadores interior'] = interiorPeople;
        
        if (!newHistory['Acomodadores interior']) newHistory['Acomodadores interior'] = [];
        interiorPeople.forEach(name => {
          newHistory['Acomodadores interior'].push(name);
        });
        
        if (newHistory['Acomodadores interior'].length > getPeopleForRole('Acomodadores interior').length * 2) {
          newHistory['Acomodadores interior'] = newHistory['Acomodadores interior'].slice(-getPeopleForRole('Acomodadores interior').length);
        }
      }

      newAssignments[weekKey] = weekAssignments;
    });

    setAssignments(newAssignments);
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory({});
    setAssignments({});
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const weeks = generateWeeks(currentMonth, currentYear);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Asignador de Responsabilidades</h1>
        </div>

        {/* Month/Year selector */}
        <div className="flex gap-4 mb-6">
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1}>{month}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={currentYear} 
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md w-20"
          />
          <button 
            onClick={clearHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Historial
          </button>
        </div>

        {/* People management */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Gestión de Personas</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              placeholder="Nombre de la persona"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPerson()}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button 
              onClick={addPerson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Agregar Varios
            </button>
          </div>

          {showBulkInput && (
            <div className="mb-4">
              <textarea 
                placeholder="Escribe un nombre por línea"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                className="w-full px-3 py-2 border rounded-md h-32"
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={addBulkPeople}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar Todos
                </button>
                <button 
                  onClick={() => setShowBulkInput(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* People list with roles */}
          <div className="space-y-4">
            {people.map(person => (
              <div key={person.id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleAllRoles(person.id, true)}
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      title="Seleccionar todos los roles"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Todos</span>
                    </button>
                    <button 
                      onClick={() => toggleAllRoles(person.id, false)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      title="Quitar todos los roles"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs">Ninguno</span>
                    </button>
                    <button 
                      onClick={() => deletePerson(person.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar persona"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <button
                        onClick={() => toggleRole(person.id, role)}
                        className="flex items-center"
                      >
                        {person.roles[role] ? 
                          <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                          <Square className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={generateAssignments}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-6"
        >
          Generar Asignaciones para {months[currentMonth - 1]} {currentYear}
        </button>

        {/* Assignments display */}
        {weeks.length > 0 && assignments && Object.keys(assignments).length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Asignaciones - {months[currentMonth - 1]} {currentYear}</h2>
            {weeks.map((week, index) => (
              <div key={week.key} className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">
                  Semana {index + 1}: {formatDateRange(week.start, week.end)}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map(role => {
                    const assignment = assignments[week.key]?.[role];
                    if (!assignment) return null;
                    
                    return (
                      <div key={role} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">{role}:</span>
                        <div className="flex items-center gap-2">
                          <span>
                            {Array.isArray(assignment) ? assignment.join(', ') : assignment}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(Array.isArray(assignment) ? assignment.join(', ') : assignment)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentScheduler;