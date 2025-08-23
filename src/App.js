import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Copy, RotateCcw, CheckSquare, Square, CheckCircle, XCircle } from 'lucide-react';

const AssignmentScheduler = () => {
  const [people, setPeople] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(9); // September
  const [currentYear, setCurrentYear] = useState(2024);
  const [assignments, setAssignments] = useState({});
  const [history, setHistory] = useState([]); // Changed to array
  const [newPersonName, setNewPersonName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [vidaMinisterio2Weeks, setVidaMinisterio2Weeks] = useState({});
  const [activeTab, setActiveTab] = useState('programa'); // 'programa', 'nombrados', or 'matriculados'

  const [matriculados, setMatriculados] = useState([]);
  const [newMatriculadoName, setNewMatriculadoName] = useState('');
  const [newMatriculadoGender, setNewMatriculadoGender] = useState('hombre');
  const [bulkMatriculadosNames, setBulkMatriculadosNames] = useState('');
  const [showBulkMatriculadosInput, setShowBulkMatriculadosInput] = useState(false);
  const [assignmentsPerWeekConfig, setAssignmentsPerWeekConfig] = useState({});
  const [matriculadoHistory, setMatriculadoHistory] = useState([]); // Changed to array

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPeople = localStorage.getItem('assignmentPeople');
    const savedHistory = localStorage.getItem('assignmentHistory');
    const savedVidaMinisterio2 = localStorage.getItem('vidaMinisterio2Weeks');
    const savedMatriculados = localStorage.getItem('assignmentMatriculados');
    const savedMatriculadoHistory = localStorage.getItem('assignmentMatriculadoHistory');
    
    if (savedPeople) {
      try {
        setPeople(JSON.parse(savedPeople));
      } catch (e) {
        console.error('Error loading people:', e);
      }
    }

    if (savedMatriculados) {
      try {
        const parsedMatriculados = JSON.parse(savedMatriculados);
        // Data migration for older format
        const migratedMatriculados = parsedMatriculados.map(p => ({
          ...p,
          roles: p.roles || { lecturaBiblia: false }
        }));
        setMatriculados(migratedMatriculados);
      } catch (e) {
        console.error('Error loading matriculados:', e);
      }
    }
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        } else {
          setHistory([]); // Reset if old format is detected
        }
      } catch (e) {
        console.error('Error loading history:', e);
        setHistory([]);
      }
    }

    if (savedMatriculadoHistory) {
      try {
        const parsed = JSON.parse(savedMatriculadoHistory);
        if (Array.isArray(parsed)) {
          setMatriculadoHistory(parsed);
        } else {
          setMatriculadoHistory([]); // Reset if old format is detected
        }
      } catch (e) {
        console.error('Error loading matriculado history:', e);
        setMatriculadoHistory([]);
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

  useEffect(() => {
    localStorage.setItem('assignmentMatriculados', JSON.stringify(matriculados));
  }, [matriculados]);

  useEffect(() => {
    localStorage.setItem('assignmentMatriculadoHistory', JSON.stringify(matriculadoHistory));
  }, [matriculadoHistory]);

  const weeks = generateWeeks(currentMonth, currentYear);

  useEffect(() => {
    const newConfig = {};
    weeks.forEach(week => {
      newConfig[week.key] = assignmentsPerWeekConfig[week.key] || 2;
    });
    setAssignmentsPerWeekConfig(newConfig);
  }, [currentMonth, currentYear]);

  const handleWeekConfigChange = (weekKey, value) => {
    setAssignmentsPerWeekConfig(prev => ({
      ...prev,
      [weekKey]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const addMatriculado = () => {
    if (newMatriculadoName.trim()) {
      const newMatriculado = {
        id: Date.now(),
        name: newMatriculadoName.trim(),
        gender: newMatriculadoGender,
        roles: { lecturaBiblia: false },
      };
      setMatriculados([...matriculados, newMatriculado]);
      setNewMatriculadoName('');
    }
  };

  const deleteMatriculado = (personId) => {
    setMatriculados(matriculados.filter(person => person.id !== personId));
  };

  const updateMatriculadoGender = (personId, newGender) => {
    setMatriculados(matriculados.map(person =>
      person.id === personId ? { ...person, gender: newGender, roles: person.roles || { lecturaBiblia: false } } : person
    ));
  };

  const toggleMatriculadoRole = (personId, role) => {
    setMatriculados(matriculados.map(person => {
      if (person.id === personId) {
        return {
          ...person,
          roles: {
            ...person.roles,
            [role]: !person.roles[role]
          }
        };
      }
      return person;
    }));
  };

  const addBulkMatriculados = () => {
    if (bulkMatriculadosNames.trim()) {
      const names = bulkMatriculadosNames.split('\n').filter(name => name.trim());
      const newPeople = names.map(name => ({
        id: Date.now() + Math.random(),
        name: name.trim(),
        gender: 'hombre', // Default gender, user can change it later
        roles: { lecturaBiblia: false },
      }));
      setMatriculados([...matriculados, ...newPeople]);
      setBulkMatriculadosNames('');
      setShowBulkMatriculadosInput(false);
    }
  };

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

    // Flatten history for rotation logic
    const flatHistory = history.reduce((acc, monthHistory) => {
      Object.entries(monthHistory.data).forEach(([role, names]) => {
        if (!acc[role]) acc[role] = [];
        acc[role].push(...names);
      });
      return acc;
    }, {});

    const flatMatriculadoHistory = matriculadoHistory.reduce((acc, monthHistory) => {
      Object.entries(monthHistory.data).forEach(([personId, data]) => {
        if (!acc[personId]) acc[personId] = { encargado: 0, ayudante: 0, assignments: [] };
        acc[personId].encargado += data.encargado;
        acc[personId].ayudante += data.ayudante;
        acc[personId].assignments.push(...data.assignments);
      });
      return acc;
    }, {});

    const newHistory = { ...flatHistory };
    const newMatriculadoHistory = JSON.parse(JSON.stringify(flatMatriculadoHistory)); // Deep copy

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

    // --- MATRICULADOS ASSIGNMENT LOGIC ---
    const matriculadosWeeks = generateWeeks(currentMonth, currentYear);
    matriculadosWeeks.forEach((week, weekIndex) => {
      const weekKey = week.key;
      const weekAssignments = newAssignments[weekKey] || {};
      const usedThisWeek = Object.values(weekAssignments).flat();

      // Find the previous week's key
      const previousWeekKey = weekIndex > 0 ? matriculadosWeeks[weekIndex - 1].key : null;

      // 1. Get available matriculados
      let availableMatriculados = matriculados.filter(m => !usedThisWeek.includes(m.name));

      // Filter based on bi-weekly rule (can't be assigned in the previous week)
      if (previousWeekKey && newAssignments[previousWeekKey]) {
        const usedLastWeek = Object.values(newAssignments[previousWeekKey]).flat().map(a => (typeof a === 'object' && a !== null) ? [a.encargado, a.ayudante] : a).flat().filter(Boolean);
        availableMatriculados = availableMatriculados.filter(m => !usedLastWeek.includes(m.name));
      }

      // 2. Group by gender
      const availableMen = availableMatriculados.filter(m => m.gender === 'hombre');
      const availableWomen = availableMatriculados.filter(m => m.gender === 'mujer');

      let usedInMatriculadoLoop = [];

      // Assign Lectura de la biblia
      const lectoresDisponibles = availableMatriculados.filter(m => m.gender === 'hombre' && m.roles?.lecturaBiblia);

      const getNextLector = (used) => {
        const available = lectoresDisponibles.filter(l => !used.includes(l.name));
        if (available.length === 0) return null;
        // Simple rotation for now
        return available[weekIndex % available.length];
      };

      const lectorSalaA = getNextLector(usedInMatriculadoLoop);
      if (lectorSalaA) {
        weekAssignments['Sala A Lectura Biblia'] = lectorSalaA.name;
        usedInMatriculadoLoop.push(lectorSalaA.name);
      }

      const lectorSalaB = getNextLector(usedInMatriculadoLoop);
      if (lectorSalaB) {
        weekAssignments['Sala B Lectura Biblia'] = lectorSalaB.name;
        usedInMatriculadoLoop.push(lectorSalaB.name);
      }


      const assignmentsForThisWeek = assignmentsPerWeekConfig[weekKey] || 0;

      // 3. Loop for assignments per week
      for (let i = 0; i < assignmentsForThisWeek; i++) {
        const assignmentNum = i + 1;

        let genderGroup;
        // New Rule: Asignacion 1 of Week 1 is men. All others are women.
        if (weekIndex === 0 && i === 0) {
          genderGroup = availableMen;
        } else {
          genderGroup = availableWomen;
        }

        const assignPair = (sala) => {
          // Sort by fairness: those who have been encargados/ayudantes less often come first
          const sortedGroup = [...genderGroup].filter(p => !usedInMatriculadoLoop.includes(p.name)).sort((a, b) => {
            const historyA = newMatriculadoHistory[a.id] || { encargado: 0, ayudante: 0 };
            const historyB = newMatriculadoHistory[b.id] || { encargado: 0, ayudante: 0 };
            if (historyA.encargado !== historyB.encargado) return historyA.encargado - historyB.encargado;
            return historyA.ayudante - historyB.ayudante;
          });

          if (sortedGroup.length < 2) return; // Not enough people

          const encargado = sortedGroup[0];
          const ayudante = sortedGroup[1];

          const assignmentKey = `Sala ${sala} Asignacion ${assignmentNum}`;
          weekAssignments[assignmentKey] = {
            encargado: encargado.name,
            ayudante: ayudante.name
          };

          usedInMatriculadoLoop.push(encargado.name, ayudante.name);

          // Update history
          const historyEncargado = newMatriculadoHistory[encargado.id] || { encargado: 0, ayudante: 0, assignments: [] };
          const historyAyudante = newMatriculadoHistory[ayudante.id] || { encargado: 0, ayudante: 0, assignments: [] };

          newMatriculadoHistory[encargado.id] = {
            ...historyEncargado,
            encargado: historyEncargado.encargado + 1,
            assignments: [...historyEncargado.assignments, { weekKey, role: 'encargado' }]
          };
          newMatriculadoHistory[ayudante.id] = {
            ...historyAyudante,
            ayudante: historyAyudante.ayudante + 1,
            assignments: [...historyAyudante.assignments, { weekKey, role: 'ayudante' }]
          };
        };

        // Try to assign to Sala A
        assignPair('A');
        // Try to assign to Sala B
        assignPair('B');
      }
      newAssignments[weekKey] = weekAssignments;
    });

    setAssignments(newAssignments);
    // setHistory(newHistory);
    // setMatriculadoHistory(newMatriculadoHistory);
  };

  const approveAndSaveHistory = () => {
    if (Object.keys(assignments).length === 0) {
      alert("Primero debes generar asignaciones antes de poder aprobarlas.");
      return;
    }

    const monthIdentifier = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    // Check if this month is already in history to prevent duplicates
    if (history.some(h => h.month === monthIdentifier) || matriculadoHistory.some(h => h.month === monthIdentifier)) {
      if (!window.confirm("Ya existe un historial para este mes. ¿Deseas sobrescribirlo?")) {
        return;
      }
    }

    // Process current assignments to generate history for this month
    const newMonthHistory = {};
    const newMonthMatriculadoHistory = {};

    Object.values(assignments).forEach(weekAssignments => {
      Object.entries(weekAssignments).forEach(([role, assignment]) => {
        if (roles.includes(role)) {
          if (!newMonthHistory[role]) newMonthHistory[role] = [];
          const names = Array.isArray(assignment) ? assignment : [assignment];
          newMonthHistory[role].push(...names);
        } else if (/^Sala [AB] Asignacion \d+$/.test(role)) {
          const { encargado, ayudante } = assignment;
          const encargadoPerson = matriculados.find(p => p.name === encargado);
          const ayudantePerson = matriculados.find(p => p.name === ayudante);

          if (encargadoPerson) {
            if (!newMonthMatriculadoHistory[encargadoPerson.id]) newMonthMatriculadoHistory[encargadoPerson.id] = { encargado: 0, ayudante: 0, assignments: [] };
            newMonthMatriculadoHistory[encargadoPerson.id].encargado += 1;
          }
          if (ayudantePerson) {
            if (!newMonthMatriculadoHistory[ayudantePerson.id]) newMonthMatriculadoHistory[ayudantePerson.id] = { encargado: 0, ayudante: 0, assignments: [] };
            newMonthMatriculadoHistory[ayudantePerson.id].ayudante += 1;
          }
        }
      });
    });

    // Filter out the current month if it exists, to handle overwrites
    const filteredHistory = history.filter(h => h.month !== monthIdentifier);
    const filteredMatriculadoHistory = matriculadoHistory.filter(h => h.month !== monthIdentifier);

    // Add the new history and apply the 2-month window
    const updatedHistory = [...filteredHistory, { month: monthIdentifier, data: newMonthHistory }].slice(-2);
    const updatedMatriculadoHistory = [...filteredMatriculadoHistory, { month: monthIdentifier, data: newMonthMatriculadoHistory }].slice(-2);

    setHistory(updatedHistory);
    setMatriculadoHistory(updatedMatriculadoHistory);

    alert(`El historial para ${months[currentMonth - 1]} ${currentYear} ha sido guardado y aprobado.`);
  };

  const clearHistory = () => {
    setHistory({});
    setMatriculadoHistory({});
    setAssignments({});
  };

  const exportData = () => {
    const dataToExport = {
      people,
      matriculados,
      history,
      matriculadoHistory,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `asignaciones_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.people && importedData.matriculados && importedData.history && importedData.matriculadoHistory) {
          setPeople(importedData.people);
          setMatriculados(importedData.matriculados);
          setHistory(importedData.history);
          setMatriculadoHistory(importedData.matriculadoHistory);
          setAssignments({}); // Clear current assignments
          alert('Datos importados con éxito!');
        } else {
          alert('El archivo de importación no tiene el formato correcto.');
        }
      } catch (error) {
        console.error('Error parsing imported file:', error);
        alert('Error al leer o procesar el archivo.');
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = importData;
    input.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getSortedRolesForDisplay = (weekAssignments) => {
    const allKeys = Object.keys(weekAssignments || {});

    const lecturaBiblia = allKeys.filter(role => /Lectura Biblia/.test(role)).sort();
    const salaA = allKeys.filter(role => /Sala A Asignacion/.test(role)).sort();
    const salaB = allKeys.filter(role => /Sala B Asignacion/.test(role)).sort();

    const finalOrder = [
      'Presidente', 'Oracion inicial', 'Tesoros', 'Perlas',
      ...lecturaBiblia,
      ...salaA,
      ...salaB,
      'Vida y ministerio', 'Vida y ministerio 2', 'Estudio biblico',
      'Lector del libro', 'Oracion final', 'Acomodadores exterior', 'Acomodadores interior'
    ];

    // Return a new array with only the keys that exist in the assignments, but sorted.
    return finalOrder.filter(role => allKeys.includes(role));
  };

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
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            Exportar
          </button>
          <button
            onClick={triggerImport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            Importar
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('programa')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'programa' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Programa
          </button>
          <button
            onClick={() => setActiveTab('nombrados')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'nombrados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Nombrados
          </button>
          <button
            onClick={() => setActiveTab('matriculados')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'matriculados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Matriculados
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'historial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Historial
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'programa' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">Bienvenido al Asignador de Responsabilidades</h2>
            <p className="text-gray-600 mt-2">
              Selecciona el mes y el año, luego haz clic en "Generar Asignaciones".<br/>
              Usa las pestañas "Nombrados" y "Matriculados" para gestionar las listas de personas.
            </p>
          </div>
        )}

        {activeTab === 'nombrados' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Gestión de Nombrados</h2>
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
        )}

        {activeTab === 'matriculados' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Gestión de Matriculados</h2>
            </div>

            {/* Form to add new matriculado */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nombre del matriculado"
                value={newMatriculadoName}
                onChange={(e) => setNewMatriculadoName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMatriculado()}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <select
                value={newMatriculadoGender}
                onChange={(e) => setNewMatriculadoGender(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
              <button
                onClick={addMatriculado}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowBulkMatriculadosInput(!showBulkMatriculadosInput)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Agregar Varios
              </button>
            </div>

            {showBulkMatriculadosInput && (
              <div className="mb-4">
                <textarea
                  placeholder="Escribe un nombre por línea"
                  value={bulkMatriculadosNames}
                  onChange={(e) => setBulkMatriculadosNames(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md h-32"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={addBulkMatriculados}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agregar Todos
                  </button>
                  <button
                    onClick={() => setShowBulkMatriculadosInput(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* List of matriculados */}
            <div className="space-y-2">
              {matriculados.map(person => (
                <div key={person.id} className="bg-white p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{person.name}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={person.gender}
                        onChange={(e) => updateMatriculadoGender(person.id, e.target.value)}
                        className={`border rounded-md py-1 px-2 text-sm ${person.gender === 'hombre' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}
                      >
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                      </select>
                      <button
                        onClick={() => deleteMatriculado(person.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar matriculado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {person.gender === 'hombre' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <button
                          onClick={() => toggleMatriculadoRole(person.id, 'lecturaBiblia')}
                          className="flex items-center"
                        >
                          {person.roles?.lecturaBiblia ?
                            <CheckSquare className="w-4 h-4 text-blue-600" /> :
                            <Square className="w-4 h-4 text-gray-400" />
                          }
                        </button>
                        <span>Lectura de la biblia</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Historial de Asignaciones Aprobadas</h2>
            {history.length === 0 && <p>No hay historial aprobado.</p>}
            <div className="space-y-6">
              {history.map(monthEntry => (
                <div key={monthEntry.month} className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">Mes: {monthEntry.month}</h3>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Historial General</h4>
                    {Object.entries(monthEntry.data).map(([role, names]) => (
                      <div key={role} className="text-sm">
                        <span className="font-medium">{role}:</span> {names.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {matriculadoHistory.map(monthEntry => (
                 <div key={monthEntry.month} className="bg-white p-4 rounded-lg border mt-4">
                   <h3 className="text-lg font-bold text-purple-700 mb-2">Mes (Matriculados): {monthEntry.month}</h3>
                   <div className="space-y-2">
                     <h4 className="font-semibold">Historial de Matriculados (conteo de roles)</h4>
                     {Object.entries(monthEntry.data).map(([personId, data]) => {
                        const person = matriculados.find(p => p.id === parseInt(personId));
                        return (
                          <div key={personId} className="text-sm">
                            <span className="font-medium">{person ? person.name : 'ID no encontrado'}:</span>
                            {` Encargado: ${data.encargado}, Ayudante: ${data.ayudante}`}
                          </div>
                        )
                     })}
                   </div>
                 </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Configurar Asignaciones de Matriculados</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {weeks.map((week, index) => (
              <div key={week.key} className="flex flex-col">
                <label htmlFor={`week-${week.key}`} className="font-semibold text-sm mb-1">
                  Semana {index + 1}
                </label>
                <input
                  type="number"
                  id={`week-${week.key}`}
                  value={assignmentsPerWeekConfig[week.key] || 0}
                  onChange={(e) => handleWeekConfigChange(week.key, e.target.value)}
                  className="px-3 py-2 border rounded-md w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateAssignments}
            className="w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Generar Asignaciones para {months[currentMonth - 1]} {currentYear}
          </button>
          <button
            onClick={approveAndSaveHistory}
            disabled={Object.keys(assignments).length === 0}
            className="w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Aprobar y Guardar Historial
          </button>
        </div>

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
                  {getSortedRolesForDisplay(assignments[week.key]).map(role => {
                    const assignment = assignments[week.key][role];
                    let assignmentText = '';
                    let copyText = '';

                    if (typeof assignment === 'object' && assignment !== null && 'encargado' in assignment) {
                      assignmentText = `${assignment.encargado} / ${assignment.ayudante}`;
                      copyText = assignmentText;
                    } else {
                      assignmentText = Array.isArray(assignment) ? assignment.join(', ') : assignment;
                      copyText = assignmentText;
                    }

                    if (!assignment) return null;

                    return (
                      <div key={role} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">{role}:</span>
                        <div className="flex items-center gap-2">
                          <span>{assignmentText}</span>
                          <button
                            onClick={() => copyToClipboard(copyText)}
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