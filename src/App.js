import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Copy, RotateCcw, CheckSquare, Square, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const roleCosts = {
  'Presidente': 1,
  'Tesoros': 1,
  'Perlas': 1,
  'Vida y ministerio': 1,
  'Estudio biblico': 1,
  'Lector del libro': 1,
  'Vida y ministerio 2': 1,
  'Oracion inicial': 0.5,
  'Oracion final': 0.5,
  'Acomodadores exterior': 0.5,
  'Acomodadores interior': 0.5,
  'Sala A Lectura Biblia': 2,
  'Sala B Lectura Biblia': 2,
  'Sala A Asignacion': 2,
  'Sala B Asignacion': 2,
};

const AssignmentScheduler = () => {
  const [people, setPeople] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(9);
  const [currentYear, setCurrentYear] = useState(2024);
  const [assignments, setAssignments] = useState({});
  const [history, setHistory] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [activeTab, setActiveTab] = useState('programa');
  const [matriculados, setMatriculados] = useState([]);
  const [newMatriculadoName, setNewMatriculadoName] = useState('');
  const [newMatriculadoGender, setNewMatriculadoGender] = useState('hombre');
  const [bulkMatriculadosNames, setBulkMatriculadosNames] = useState('');
  const [showBulkMatriculadosInput, setShowBulkMatriculadosInput] = useState(false);
  const [assignmentsPerWeekConfig, setAssignmentsPerWeekConfig] = useState({});
  const [matriculadoHistory, setMatriculadoHistory] = useState([]);

  const generateWeeks = (month, year) => {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    while (startDate <= lastDay) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekHasCurrentMonth = (startDate.getMonth() + 1 === month && startDate.getFullYear() === year) || (endDate.getMonth() + 1 === month && endDate.getFullYear() === year) || (startDate < firstDay && endDate > lastDay);
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

  useEffect(() => {
    const savedPeople = localStorage.getItem('assignmentPeople');
    if (savedPeople) { try { setPeople(JSON.parse(savedPeople)); } catch (e) { console.error('Error loading people:', e); } }

    const savedMatriculados = localStorage.getItem('assignmentMatriculados');
    if (savedMatriculados) { try { const parsed = JSON.parse(savedMatriculados); setMatriculados(parsed.map(p => ({ ...p, roles: p.roles || { lecturaBiblia: false } }))); } catch (e) { console.error('Error loading matriculados:', e); } }
    
    const savedHistory = localStorage.getItem('assignmentHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && parsed[0].data) {
            console.log("Old history format detected. Clearing history to prevent errors.");
            setHistory([]);
          } else {
            setHistory(parsed);
          }
        } else {
          setHistory([]);
        }
      } catch (e) { console.error('Error loading history:', e); setHistory([]); }
    }

    const savedMatriculadoHistory = localStorage.getItem('assignmentMatriculadoHistory');
    if (savedMatriculadoHistory) { try { const parsed = JSON.parse(savedMatriculadoHistory); if (Array.isArray(parsed)) { setMatriculadoHistory(parsed); } else { setMatriculadoHistory([]); } } catch (e) { console.error('Error loading matriculado history:', e); setMatriculadoHistory([]); } }
  }, []);

  useEffect(() => { localStorage.setItem('assignmentPeople', JSON.stringify(people)); }, [people]);
  useEffect(() => { localStorage.setItem('assignmentHistory', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('assignmentMatriculados', JSON.stringify(matriculados)); }, [matriculados]);
  useEffect(() => { localStorage.setItem('assignmentMatriculadoHistory', JSON.stringify(matriculadoHistory)); }, [matriculadoHistory]);

  const weeks = generateWeeks(currentMonth, currentYear);
  useEffect(() => { const newConfig = {}; weeks.forEach(week => { newConfig[week.key] = assignmentsPerWeekConfig[week.key] || 2; }); setAssignmentsPerWeekConfig(newConfig); }, [currentMonth, currentYear, weeks]);

  const handleWeekConfigChange = (weekKey, value) => { setAssignmentsPerWeekConfig(prev => ({ ...prev, [weekKey]: Math.max(0, parseInt(value) || 0) })); };
  const addMatriculado = () => { if (newMatriculadoName.trim()) { setMatriculados([...matriculados, { id: Date.now(), name: newMatriculadoName.trim(), gender: newMatriculadoGender, roles: { lecturaBiblia: false } }]); setNewMatriculadoName(''); } };
  const deleteMatriculado = (personId) => { setMatriculados(matriculados.filter(person => person.id !== personId)); };
  const updateMatriculadoGender = (personId, newGender) => { setMatriculados(matriculados.map(p => p.id === personId ? { ...p, gender: newGender, roles: p.roles || { lecturaBiblia: false } } : p)); };
  const toggleMatriculadoRole = (personId, role) => { setMatriculados(matriculados.map(p => { if (p.id === personId) { const currentRoles = p.roles || {}; return { ...p, roles: { ...currentRoles, [role]: !currentRoles[role] } }; } return p; })); };
  const addBulkMatriculados = () => { if (bulkMatriculadosNames.trim()) { const names = bulkMatriculadosNames.split('\n').filter(name => name.trim()); setMatriculados([...matriculados, ...names.map(name => ({ id: Date.now() + Math.random(), name: name.trim(), gender: 'hombre', roles: { lecturaBiblia: false } }))]); setBulkMatriculadosNames(''); setShowBulkMatriculadosInput(false); } };
  const roles = [ 'Presidente', 'Oracion inicial', 'Tesoros', 'Perlas', 'Vida y ministerio', 'Vida y ministerio 2', 'Estudio biblico', 'Lector del libro', 'Oracion final', 'Acomodadores exterior', 'Acomodadores interior' ];
  const months = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ];
  const formatDateRange = (start, end) => `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  const addPerson = () => { if (newPersonName.trim()) { const newPerson = { id: Date.now(), name: newPersonName.trim(), roles: {} }; roles.forEach(role => { newPerson.roles[role] = false; }); setPeople([...people, newPerson]); setNewPersonName(''); } };
  const addBulkPeople = () => { if (bulkNames.trim()) { const names = bulkNames.split('\n').filter(name => name.trim()); setPeople([...people, ...names.map(name => ({ id: Date.now() + Math.random(), name: name.trim(), roles: roles.reduce((acc, role) => ({ ...acc, [role]: false }), {}) }))]); setBulkNames(''); setShowBulkInput(false); } };
  const toggleRole = (personId, role) => { setPeople(people.map(p => p.id === personId ? { ...p, roles: { ...p.roles, [role]: !p.roles[role] } } : p)); };
  const toggleAllRoles = (personId, assign) => { setPeople(people.map(p => p.id === personId ? { ...p, roles: Object.keys(p.roles).reduce((acc, role) => ({ ...acc, [role]: assign }), {}) } : p)); };
  const deletePerson = (personId) => { setPeople(people.filter(person => person.id !== personId)); };
  const getPeopleForRole = (role) => people.filter(p => p.roles && p.roles[role]);

  const generateAssignments = () => {
    const newAssignments = {};
    const monthlyUsage = {};
    const usedInLastWeekOfPrevMonth = new Set();
    const lastMonthIdentifier = new Date(currentYear, currentMonth - 2, 15).toISOString().slice(0, 7);
    const lastMonthHistory = history.find(h => h.month === lastMonthIdentifier);
    if (lastMonthHistory && lastMonthHistory.weeks) {
      const weekKeys = Object.keys(lastMonthHistory.weeks).sort();
      const lastWeekKey = weekKeys[weekKeys.length - 1];
      if (lastWeekKey) {
        const lastWeekAssignments = lastMonthHistory.weeks[lastWeekKey];
        Object.values(lastWeekAssignments).forEach(assignment => {
          if (!assignment) return;
          if (typeof assignment === 'string') usedInLastWeekOfPrevMonth.add(assignment);
          else if (Array.isArray(assignment)) assignment.forEach(name => usedInLastWeekOfPrevMonth.add(name));
          else if (typeof assignment === 'object' && 'encargado' in assignment) { usedInLastWeekOfPrevMonth.add(assignment.encargado); usedInLastWeekOfPrevMonth.add(assignment.ayudante); }
        });
        usedInLastWeekOfPrevMonth.delete('VACANTE');
      }
    }
    const twoMonthsAgoIdentifier = new Date(currentYear, currentMonth - 3, 15).toISOString().slice(0, 7);
    const lastMonthMatriculadoHistory = matriculadoHistory.find(h => h.month === lastMonthIdentifier)?.data || {};
    const twoMonthsAgoMatriculadoHistory = matriculadoHistory.find(h => h.month === twoMonthsAgoIdentifier)?.data || {};
    const mustRestMatriculados = new Set();
    const matriculadoRotationInfo = {};
    matriculados.forEach(person => {
      const hadAsignacionLastMonth = lastMonthMatriculadoHistory[person.id];
      const hadAsignacionTwoMonthsAgo = twoMonthsAgoMatriculadoHistory[person.id];
      if (hadAsignacionLastMonth && hadAsignacionTwoMonthsAgo) mustRestMatriculados.add(person.id);
      if (hadAsignacionLastMonth) {
        if (hadAsignacionLastMonth.encargado > 0) matriculadoRotationInfo[person.id] = 'encargado';
        else if (hadAsignacionLastMonth.ayudante > 0) matriculadoRotationInfo[person.id] = 'ayudante';
      }
    });
    const getNextPerson = (candidates, { role, weekIndex, usedInWeek, isPairAssignment = false, pairRoleType = null }) => {
      let roleCost, isMatriculadoRole = false;
      if (isPairAssignment) { roleCost = roleCosts['Sala A Asignacion']; isMatriculadoRole = true; }
      else { roleCost = roleCosts[role] || 1; if (role.includes('Lectura Biblia')) isMatriculadoRole = true; }
      const eligible = candidates.filter(p => {
        if (!p) return false;
        const usage = monthlyUsage[p.name] || { points: 0, lastAssignedWeekIndex: -1 };
        if (usedInWeek.includes(p.name)) return false;
        if (weekIndex === 0 && usedInLastWeekOfPrevMonth.has(p.name)) return false;
        if (usage.lastAssignedWeekIndex === weekIndex - 1) return false;
        if (usage.points + roleCost > 2) return false;
        if (isMatriculadoRole) {
          if (mustRestMatriculados.has(p.id)) return false;
          const lastMonthRole = matriculadoRotationInfo[p.id];
          if (lastMonthRole === 'ayudante' && pairRoleType === 'ayudante') return false;
        }
        return true;
      });
      if (eligible.length === 0) return null;
      const scored = eligible.map(p => {
        let score = 100;
        const usage = monthlyUsage[p.name] || { points: 0 };
        if (isPairAssignment && pairRoleType === 'encargado' && matriculadoRotationInfo[p.id] === 'ayudante') score += 50;
        score -= usage.points * 20;
        score += Math.random() * 10;
        return { person: p, score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored[0].person;
    };
    weeks.forEach((week, weekIndex) => {
      const weekKey = week.key;
      const weekAssignments = {};
      const usedThisWeek = [];
      const assignAndTrack = (person, role, isPairAssignment = false) => {
        if (!person) return;
        let roleCost = isPairAssignment ? roleCosts['Sala A Asignacion'] : (roleCosts[role] || 1);
        const name = person.name;
        if (!monthlyUsage[name]) monthlyUsage[name] = { points: 0, lastAssignedWeekIndex: -1 };
        monthlyUsage[name].points += roleCost;
        monthlyUsage[name].lastAssignedWeekIndex = weekIndex;
        usedThisWeek.push(name);
      };
      const allNombradoRoles = [ 'Presidente', 'Oracion inicial', 'Tesoros', 'Perlas', 'Vida y ministerio', 'Estudio biblico', 'Lector del libro', 'Oracion final', 'Vida y ministerio 2' ];

      allNombradoRoles.forEach(role => {
        const candidates = getPeopleForRole(role);
        const person = getNextPerson(candidates, { role, weekIndex, usedInWeek });
        if (person) {
          weekAssignments[role] = person.name;
          assignAndTrack(person, role);
        } else {
          weekAssignments[role] = 'VACANTE';
        }
      });
      const assignGroup = (role, count) => {
        const assignedPeople = [];
        const candidates = getPeopleForRole(role);
        for (let i = 0; i < count; i++) {
          const person = getNextPerson(candidates, { role, weekIndex, usedInWeek });
          if (person) { assignedPeople.push(person.name); assignAndTrack(person, role); }
        }
        weekAssignments[role] = assignedPeople.length > 0 ? assignedPeople : ['VACANTE'];
      };
      assignGroup('Acomodadores exterior', 3);
      assignGroup('Acomodadores interior', 2);
      const availableMen = matriculados.filter(m => m.gender === 'hombre');
      const availableWomen = matriculados.filter(m => m.gender === 'mujer');
      const lectoresDisponibles = availableMen.filter(m => m && m.roles && m.roles.lecturaBiblia);
      const lectorSalaA = getNextPerson(lectoresDisponibles, { role: 'Sala A Lectura Biblia', weekIndex, usedInWeek });
      weekAssignments['Sala A Lectura Biblia'] = lectorSalaA ? lectorSalaA.name : 'VACANTE';
      if (lectorSalaA) assignAndTrack(lectorSalaA, 'Sala A Lectura Biblia');
      const lectorSalaB = getNextPerson(lectoresDisponibles, { role: 'Sala B Lectura Biblia', weekIndex, usedInWeek });
      weekAssignments['Sala B Lectura Biblia'] = lectorSalaB ? lectorSalaB.name : 'VACANTE';
      if (lectorSalaB) assignAndTrack(lectorSalaB, 'Sala B Lectura Biblia');
      const assignmentsForThisWeek = assignmentsPerWeekConfig[weekKey] || 0;
      for (let i = 0; i < assignmentsForThisWeek; i++) {
        const assignmentNum = i + 1;
        let genderGroup = (weekIndex === 0 && i === 0) ? availableMen : availableWomen;
        const assignPair = (sala) => {
          const assignmentKey = `Sala ${sala} Asignacion ${assignmentNum}`;
          const roleName = `Sala ${sala} Asignacion`;
          const encargado = getNextPerson(genderGroup, { role: roleName, weekIndex, usedInWeek, isPairAssignment: true, pairRoleType: 'encargado' });
          if (encargado) assignAndTrack(encargado, roleName, true);
          const ayudante = getNextPerson(genderGroup, { role: roleName, weekIndex, usedInWeek, isPairAssignment: true, pairRoleType: 'ayudante' });
          if (ayudante) assignAndTrack(ayudante, roleName, true);
          weekAssignments[assignmentKey] = { encargado: encargado ? encargado.name : 'VACANTE', ayudante: ayudante ? ayudante.name : 'VACANTE' };
        };
        assignPair('A');
        assignPair('B');
      }
      newAssignments[weekKey] = weekAssignments;
    });
    setAssignments(newAssignments);
  };

  const approveAndSaveHistory = () => {
    if (Object.keys(assignments).length === 0) { alert("Primero debes generar asignaciones antes de poder aprobarlas."); return; }
    const monthIdentifier = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    if (history.some(h => h.month === monthIdentifier) || matriculadoHistory.some(h => h.month === monthIdentifier)) { if (!window.confirm("Ya existe un historial para este mes. ¿Deseas sobrescribirlo?")) { return; } }
    const newMonthMatriculadoHistory = {};
    Object.values(assignments).forEach(weekAssignments => {
      Object.entries(weekAssignments).forEach(([, assignment]) => {
        if (typeof assignment === 'object' && assignment !== null && 'encargado' in assignment) {
          const { encargado, ayudante } = assignment;
          const encargadoPerson = matriculados.find(p => p.name === encargado);
          const ayudantePerson = matriculados.find(p => p.name === ayudante);
          if (encargadoPerson) { if (!newMonthMatriculadoHistory[encargadoPerson.id]) newMonthMatriculadoHistory[encargadoPerson.id] = { encargado: 0, ayudante: 0 }; newMonthMatriculadoHistory[encargadoPerson.id].encargado += 1; }
          if (ayudantePerson) { if (!newMonthMatriculadoHistory[ayudantePerson.id]) newMonthMatriculadoHistory[ayudantePerson.id] = { encargado: 0, ayudante: 0 }; newMonthMatriculadoHistory[ayudantePerson.id].ayudante += 1; }
        }
      });
    });
    const filteredHistory = history.filter(h => h.month !== monthIdentifier);
    const filteredMatriculadoHistory = matriculadoHistory.filter(h => h.month !== monthIdentifier);
    const updatedHistory = [...filteredHistory, { month: monthIdentifier, weeks: assignments }].slice(-2);
    const updatedMatriculadoHistory = [...filteredMatriculadoHistory, { month: monthIdentifier, data: newMonthMatriculadoHistory }].slice(-2);
    setHistory(updatedHistory);
    setMatriculadoHistory(updatedMatriculadoHistory);
    alert(`El historial para ${months[currentMonth - 1]} ${currentYear} ha sido guardado y aprobado.`);
  };

  const clearHistory = () => { setHistory([]); setMatriculadoHistory([]); setAssignments({}); };
  const exportData = () => { const dataToExport = { people, matriculados, history, matriculadoHistory }; const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`; const link = document.createElement('a'); link.href = jsonString; link.download = `asignaciones_backup_${new Date().toISOString().slice(0, 10)}.json`; link.click(); };
  const importData = (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedData = JSON.parse(e.target.result); if (importedData.people && importedData.matriculados && importedData.history && importedData.matriculadoHistory) { setPeople(importedData.people); setMatriculados(importedData.matriculados); setHistory(importedData.history); setMatriculadoHistory(importedData.matriculadoHistory); setAssignments({}); alert('Datos importados con éxito!'); } else { alert('El archivo de importación no tiene el formato correcto.'); } } catch (error) { console.error('Error parsing imported file:', error); alert('Error al leer o procesar el archivo.'); } }; reader.readAsText(file); };
  const triggerImport = () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = importData; input.click(); };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };
  const getSortedRolesForDisplay = (weekAssignments) => { const allKeys = Object.keys(weekAssignments || {}); const lecturaBiblia = allKeys.filter(role => /Lectura Biblia/.test(role)).sort(); const salaA = allKeys.filter(role => /Sala A Asignacion/.test(role)).sort(); const salaB = allKeys.filter(role => /Sala B Asignacion/.test(role)).sort(); const finalOrder = [ 'Presidente', 'Oracion inicial', 'Tesoros', 'Perlas', ...lecturaBiblia, ...salaA, ...salaB, 'Vida y ministerio', 'Vida y ministerio 2', 'Estudio biblico', 'Lector del libro', 'Oracion final', 'Acomodadores exterior', 'Acomodadores interior' ]; return finalOrder.filter(role => allKeys.includes(role)); };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Asignador de Responsabilidades
            <Sparkles className="w-5 h-5 text-yellow-500" title="Versión con sistema de puntos" />
          </h1>
        </div>
        <div className="flex gap-4 mb-6">
          <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-md">
            {months.map((month, idx) => (<option key={idx} value={idx + 1}>{month}</option>))}
          </select>
          <input type="number" value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-md w-20" />
          <button onClick={clearHistory} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Limpiar Historial</button>
          <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">Exportar</button>
          <button onClick={triggerImport} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2">Importar</button>
        </div>
        <div className="flex border-b mb-6">
          <button onClick={() => setActiveTab('programa')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'programa' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Programa</button>
          <button onClick={() => setActiveTab('nombrados')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'nombrados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Nombrados</button>
          <button onClick={() => setActiveTab('matriculados')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'matriculados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Matriculados</button>
          <button onClick={() => setActiveTab('historial')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'historial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Historial</button>
        </div>
        {activeTab === 'programa' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">Bienvenido al Asignador de Responsabilidades</h2>
            <p className="text-gray-600 mt-2">Selecciona el mes y el año, luego haz clic en "Generar Asignaciones".<br/>Usa las pestañas "Nombrados" y "Matriculados" para gestionar las listas de personas.</p>
          </div>
        )}
        {activeTab === 'nombrados' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-green-600" /><h2 className="text-lg font-semibold">Gestión de Nombrados</h2></div>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Nombre de la persona" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addPerson()} className="flex-1 px-3 py-2 border rounded-md" />
              <button onClick={addPerson} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setShowBulkInput(!showBulkInput)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Agregar Varios</button>
            </div>
            {showBulkInput && (
              <div className="mb-4">
                <textarea placeholder="Escribe un nombre por línea" value={bulkNames} onChange={(e) => setBulkNames(e.target.value)} className="w-full px-3 py-2 border rounded-md h-32" />
                <div className="flex gap-2 mt-2">
                  <button onClick={addBulkPeople} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Agregar Todos</button>
                  <button onClick={() => setShowBulkInput(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {people.map(person => (
                <div key={person.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{person.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => toggleAllRoles(person.id, true)} className="text-green-600 hover:text-green-800 flex items-center gap-1" title="Seleccionar todos los roles"><CheckCircle className="w-4 h-4" /><span className="text-xs">Todos</span></button>
                      <button onClick={() => toggleAllRoles(person.id, false)} className="text-red-600 hover:text-red-800 flex items-center gap-1" title="Quitar todos los roles"><XCircle className="w-4 h-4" /><span className="text-xs">Ninguno</span></button>
                      <button onClick={() => deletePerson(person.id)} className="text-red-600 hover:text-red-800" title="Eliminar persona"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer">
                        <button onClick={() => toggleRole(person.id, role)} className="flex items-center">{person.roles[role] ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button>
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
            <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-purple-600" /><h2 className="text-lg font-semibold">Gestión de Matriculados</h2></div>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Nombre del matriculado" value={newMatriculadoName} onChange={(e) => setNewMatriculadoName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addMatriculado()} className="flex-1 px-3 py-2 border rounded-md" />
              <select value={newMatriculadoGender} onChange={(e) => setNewMatriculadoGender(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
              <button onClick={addMatriculado} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setShowBulkMatriculadosInput(!showBulkMatriculadosInput)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Agregar Varios</button>
            </div>
            {showBulkMatriculadosInput && (
              <div className="mb-4">
                <textarea placeholder="Escribe un nombre por línea" value={bulkMatriculadosNames} onChange={(e) => setBulkMatriculadosNames(e.target.value)} className="w-full px-3 py-2 border rounded-md h-32" />
                <div className="flex gap-2 mt-2">
                  <button onClick={addBulkMatriculados} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Agregar Todos</button>
                  <button onClick={() => setShowBulkMatriculadosInput(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {matriculados.map(person => (
                <div key={person.id} className="bg-white p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{person.name}</span>
                    <div className="flex items-center gap-2">
                      <select value={person.gender} onChange={(e) => updateMatriculadoGender(person.id, e.target.value)} className={`border rounded-md py-1 px-2 text-sm ${person.gender === 'hombre' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}><option value="hombre">Hombre</option><option value="mujer">Mujer</option></select>
                      <button onClick={() => deleteMatriculado(person.id)} className="text-red-600 hover:text-red-800" title="Eliminar matriculado"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {person.gender === 'hombre' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <button onClick={() => toggleMatriculadoRole(person.id, 'lecturaBiblia')} className="flex items-center">{person.roles?.lecturaBiblia ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}</button>
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
                    {Object.entries(monthEntry.weeks).map(([weekKey, weekData]) => (
                      <div key={weekKey}>
                        <h5 className="font-semibold italic text-gray-600">Semana: {weekKey}</h5>
                        {Object.entries(weekData).map(([role, assignment]) => (
                          <div key={role} className="text-sm ml-4"><span className="font-medium">{role}:</span> {typeof assignment === 'object' && assignment !== null ? `${assignment.encargado} / ${assignment.ayudante}` : (Array.isArray(assignment) ? assignment.join(', ') : assignment)}</div>
                        ))}
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
                        return (<div key={personId} className="text-sm"><span className="font-medium">{person ? person.name : 'ID no encontrado'}:</span> {` Encargado: ${data.encargado}, Ayudante: ${data.ayudante}`}</div>)
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
                <label htmlFor={`week-${week.key}`} className="font-semibold text-sm mb-1">Semana {index + 1}</label>
                <input type="number" id={`week-${week.key}`} value={assignmentsPerWeekConfig[week.key] || 0} onChange={(e) => handleWeekConfigChange(week.key, e.target.value)} className="px-3 py-2 border rounded-md w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={generateAssignments} className="w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Generar Asignaciones para {months[currentMonth - 1]} {currentYear}</button>
          <button onClick={approveAndSaveHistory} disabled={Object.keys(assignments).length === 0} className="w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Aprobar y Guardar Historial</button>
        </div>
        {weeks.length > 0 && assignments && Object.keys(assignments).length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Asignaciones - {months[currentMonth - 1]} {currentYear}</h2>
            {weeks.map((week, index) => (
              <div key={week.key} className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">Semana {index + 1}: {formatDateRange(week.start, week.end)}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {getSortedRolesForDisplay(assignments[week.key]).map(role => {
                    const assignment = assignments[week.key][role];
                    let assignmentText = '';
                    if (typeof assignment === 'object' && assignment !== null && 'encargado' in assignment) { assignmentText = `${assignment.encargado} / ${assignment.ayudante}`; }
                    else { assignmentText = Array.isArray(assignment) ? assignment.join(', ') : assignment; }
                    if (!assignment) return null;
                    return (
                      <div key={role} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">{role}:</span>
                        <div className="flex items-center gap-2">
                          <span>{assignmentText}</span>
                          <button onClick={() => copyToClipboard(assignmentText)} className="text-gray-500 hover:text-gray-700"><Copy className="w-4 h-4" /></button>
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