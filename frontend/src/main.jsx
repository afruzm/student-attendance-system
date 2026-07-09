import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, BarChart3, Bell, BookOpen, Building2, CalendarDays,
  Check, ChevronRight, ClipboardCheck, Download, Filter, GraduationCap, LayoutDashboard,
  Loader2, LogOut, Minus, PieChart, Plus, Search, ShieldCheck, Sparkles, TrendingUp, Clock, FileSpreadsheet,
  Users, X, Edit3, Trash2, Save, UserCheck, ChevronLeft
} from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const fullDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const roleTitle = { student: 'Студент', teacher: 'Преподаватель', dean: 'Деканат' };
const statusLabel = { present: '+', absent: '−', late: 'О' };

async function request(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.blob();
  if (!response.ok) throw data;
  return data;
}
const get = path => request(path);
const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
function qs(obj) {
  const line = Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return line ? `?${line}` : '';
}
function pct(value) { return Number.isFinite(value) ? Math.round(value * 10) / 10 : 0; }
function todayIso() { return new Date().toISOString().slice(0, 10); }

function useAsync(loader, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let mounted = true;
    setState(s => ({ ...s, loading: true, error: null }));
    loader()
      .then(data => mounted && setState({ loading: false, data, error: null }))
      .catch(error => mounted && setState({ loading: false, data: null, error }));
    return () => { mounted = false; };
  }, deps);
  return state;
}
function useRefs() {
  const [refs, setRefs] = useState({ groups: [], subjects: [], departments: [], teachers: [], students: [] });
  useEffect(() => {
    Promise.all([
      get('/groups/'), get('/subjects/'), get('/departments/'), get('/people/?role=teacher'), get('/people/?role=student')
    ]).then(([groups, subjects, departments, teachers, students]) => setRefs({
      groups: groups.results || groups,
      subjects: subjects.results || subjects,
      departments: departments.results || departments,
      teachers: teachers.results || teachers,
      students: students.results || students,
    })).catch(() => {});
  }, []);
  return refs;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('attendance_user') || 'null'));
  return user ? <Shell user={user} onLogout={() => { localStorage.removeItem('attendance_user'); setUser(null); }} /> : <Login onLogin={u => { localStorage.setItem('attendance_user', JSON.stringify(u)); setUser(u); }} />;
}

function Login({ onLogin }) {
  const [login, setLogin] = useState('dean');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try { onLogin(await post('/login/', { login, password })); }
    catch (e) { setError(e.error || 'Не удалось выполнить вход'); }
    finally { setLoading(false); }
  }
  return <div className="loginPage">
    <div className="blueGrid" />
    <div className="orb orbOne" /><div className="orb orbTwo" /><div className="orb orbThree" />
    <section className="loginHero">
      <div className="kfuBadge"><GraduationCap /> AttendFlow KFU</div>
      <h1>Интеллектуальная система учета посещаемости</h1>
      <p>Единая цифровая среда для деканата, преподавателей и студентов: электронный журнал, аналитика рисков, расписание и отчеты.</p>
      <div className="heroStats">
        <span><b>3</b> роли</span><span><b>24/7</b> доступ</span><span><b>DOCX</b> отчеты</span>
      </div>
    </section>
    <form className="loginCard" onSubmit={submit}>
      <div className="loginTop"><Sparkles /><span>Вход в личный кабинет</span></div>
      <label>Логин<input value={login} onChange={e => setLogin(e.target.value)} placeholder="dean" /></label>
      <label>Пароль<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="1234" /></label>
      {error && <div className="errorBox">{error}</div>}
      <button className="primaryBtn" disabled={loading}>{loading ? <Loader2 className="spin" /> : <ShieldCheck />} Войти в систему</button>
      <div className="demoBox">Демо: <b>dean</b>, <b>t4</b>, <b>t6</b>, <b>s1</b>. Пароль для всех: <b>1234</b>.</div>
    </form>
  </div>;
}

function Shell({ user, onLogout }) {
  const tabs = user.role === 'student'
    ? [['dashboard', 'Главная', LayoutDashboard], ['schedule', 'Расписание', CalendarDays], ['mine', 'Посещаемость', ClipboardCheck]]
    : user.role === 'teacher'
      ? [['dashboard', 'Главная', LayoutDashboard], ['schedule', 'Расписание', CalendarDays], ['journal', 'Электронный журнал', ClipboardCheck], ['semester', 'Семестр', BookOpen]]
      : [['dashboard', 'Главная', LayoutDashboard], ['departments', 'Кафедры', Building2]];
  const [tab, setTab] = useState('dashboard');
  return <div className="appShell">
    <aside className="sidebar">
      <div className="logo"><div><GraduationCap /></div><span>AttendFlow</span></div>
      <div className="profile"><div className="avatar">{user.full_name?.slice(0, 1)}</div><div><b>{user.full_name}</b><span>{roleTitle[user.role]} · КФУ</span></div></div>
      <nav>{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon />{label}<ChevronRight /></button>)}</nav>
      <button className="logout" onClick={onLogout}><LogOut /> Выход</button>
    </aside>
    <main className="workspace">
      <Topbar user={user} />
      {user.role === 'student' && <Student user={user} tab={tab} />}
      {user.role === 'teacher' && <Teacher user={user} tab={tab} setTab={setTab} />}
      {user.role === 'dean' && <Dean tab={tab} />}
    </main>
  </div>;
}
function Topbar({ user }) { return <header className="topbar"><div><p>Набережночелнинский институт КФУ</p><h2>{roleTitle[user.role]}ский контур</h2></div><div className="topActions"><span><Activity /> Система активна</span><button><Bell /></button></div></header>; }
function SectionTitle({ icon, title, text }) { return <div className="sectionTitle"><div>{icon}</div><span><h1>{title}</h1>{text && <p>{text}</p>}</span></div>; }
function LoadingCard() { return <div className="card loading"><Loader2 className="spin" /> Загрузка данных...</div>; }
function Empty({ text = 'Данных пока нет' }) { return <div className="empty"><Sparkles />{text}</div>; }
function Metric({ icon, label, value, hint }) { return <div className="metric"><div className="metricIcon">{icon}</div><div><span>{label}</span><b>{value}</b>{hint && <small>{hint}</small>}</div></div>; }
function Select({ label, value, onChange, items, all = 'Все' }) { return <label className="field"><span>{label}</span><select value={value || ''} onChange={e => onChange(e.target.value)}><option value="">{all}</option>{items.map(i => <option key={i.id} value={i.id}>{i.title || i.number || i.name || i.full_name}</option>)}</select></label>; }
function SubgroupSelect({ value, onChange }) { return <label className="field"><span>Подгруппа</span><select value={value || ''} onChange={e => onChange(e.target.value)}><option value="">Все</option><option value="1">1 подгруппа</option><option value="2">2 подгруппа</option></select></label>; }
function Filters({ children }) { return <div className="filters"><div className="filterLabel"><Filter /> Фильтры</div>{children}</div>; }

function HeroToday({ data, title }) {
  const date = new Date(data?.date || Date.now());
  return <section className="heroPanel">
    <div><span>{title || 'Сегодняшние занятия'}</span><h1>{date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h1><p>{data?.week_label || '—'} учебная неделя · {data?.lessons?.length || 0} занятий</p></div>
    <div className="heroIcon"><CalendarDays /></div>
  </section>;
}
function LessonCards({ lessons = [], onOpen }) {
  if (!lessons.length) return <Empty text="По выбранным фильтрам занятий нет" />;
  return <div className="lessonGrid">{lessons.map((lesson, index) => <button className="lessonCard" key={lesson.id} onClick={() => onOpen?.(lesson)} style={{ animationDelay: `${index * 45}ms` }}>
    <div className="lessonTime"><b>{lesson.time}</b><span>{lesson.week_type === 'n' ? 'нижняя' : lesson.week_type === 'v' ? 'верхняя' : 'каждая'}</span></div>
    <h3>{lesson.subject_title}</h3>
    <p>{lesson.group_number} · {lesson.lesson_type || 'занятие'} {lesson.subgroup || 'вся группа'}</p>
    <footer><span>{lesson.building}, ауд. {lesson.room}</span><small>{lesson.teacher_name}</small></footer>
  </button>)}</div>;
}
function getMonday(d = new Date()) {
  const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x;
}
function CalendarView({ lessons = [], onOpen, pageable = false }) {
  const [weekStart, setWeekStart] = useState(getMonday());
  const times = ['8:00', '9:40', '11:50', '13:30', '15:40', '17:20', '19:00'];
  const days = dayNames.map((d, i) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + i); return { title: d, date }; });
  const fmt = d => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  return <div className="calendarShell">
    {pageable && <div className="calendarToolbar"><button onClick={() => setWeekStart(w => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}><ChevronLeft /> Пред. неделя</button><b>{fmt(days[0].date)} — {fmt(days[5].date)}</b><button onClick={() => setWeekStart(w => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}>След. неделя <ChevronRight /></button></div>}
    <div className="calendarBoard"><div className="calendarHead"><b>Время</b>{days.map(d => <b key={d.title}>{d.title}<small>{fmt(d.date)}</small></b>)}</div>{times.map(time => <div className="calendarRow" key={time}><div className="slotTime">{time}</div>{days.map((day, index) => {
      const events = lessons.filter(l => l.day_of_week === index && l.time === time);
      return <div className="slot" key={day.title}>{events.map(e => <button className="miniEvent" key={e.id} onClick={() => onOpen?.(e)}><b>{e.subject_title}</b><span>{e.room} · {e.subgroup || 'вся гр.'}</span></button>)}</div>;
    })}</div>)}</div>
  </div>;
}

function Student({ user, tab }) {
  const today = useAsync(() => get(`/today-lessons/?role=student&user_id=${user.id}`), [user.id]);
  const schedule = useAsync(() => get(`/lessons/${qs({ group: user.group, subgroup: user.subgroup })}`), [user.group, user.subgroup]);
  const summary = useAsync(() => get(`/student-subject-summary/${user.id}/`), [user.id]);
  const [opened, setOpened] = useState(null);
  if (tab === 'schedule') return <><SectionTitle icon={<CalendarDays />} title="Расписание занятий" text={`Группа ${user.group_number}, подгруппа ${user.subgroup || '—'}`} />{schedule.loading ? <LoadingCard /> : <CalendarView lessons={schedule.data?.results || schedule.data || []} pageable />}</>;
  if (tab === 'mine') return <><SectionTitle icon={<ClipboardCheck />} title="Моя посещаемость" text="Сводка по предметам и список пропущенных занятий" />{summary.loading ? <LoadingCard /> : <SubjectBars data={summary.data || []} onPick={setOpened} />}{opened && <AbsencePanel subject={opened} onClose={() => setOpened(null)} />}</>;
  const metrics = calcStudentMetrics(summary.data || []);
  return <><HeroToday data={today.data} title="Личный учебный день" /><div className="metricsGrid"><Metric icon={<TrendingUp />} label="Посещаемость" value={`${metrics.percent}%`} hint="по отмеченным занятиям" /><Metric icon={<BookOpen />} label="Предметов" value={metrics.subjects} /><Metric icon={<AlertTriangle />} label="Пропусков" value={metrics.absent} hint="требуют контроля" /></div><SectionTitle icon={<CalendarDays />} title="Ближайшие пары сегодня" />{today.loading ? <LoadingCard /> : <LessonCards lessons={today.data?.lessons || []} />}</>;
}
function calcStudentMetrics(items) { const total = items.reduce((s, i) => s + (i.total || 0), 0); const present = items.reduce((s, i) => s + (i.present || 0), 0); const absent = items.reduce((s, i) => s + (i.absent || 0), 0); return { percent: pct(total ? present / total * 100 : 0), absent, subjects: items.length }; }
function SubjectBars({ data = [], onPick }) {
  if (!data.length) return <Empty text="По студенту пока нет отметок посещаемости" />;
  return <div className="subjectList">{data.map(item => <button className="subjectRow" key={item.subject} onClick={() => onPick(item)}><div><b>{item.subject}</b><span>{item.present} присутствий · {item.absent} пропусков</span></div><div className="progress"><i style={{ width: `${item.percent}%` }} /></div><strong>{item.percent}%</strong></button>)}</div>;
}
function AbsencePanel({ subject, onClose }) { return <div className="drawer"><div className="drawerCard"><button className="close" onClick={onClose}><X /></button><h2>{subject.subject}</h2><p>Детализация пропусков</p>{subject.absences?.length ? subject.absences.map((a, i) => <div className="absence" key={i}><b>{new Date(a.date).toLocaleDateString('ru-RU')}</b><span>{a.time} · {a.lesson_type} · {a.teacher}</span></div>) : <Empty text="Пропусков по предмету нет" />}</div></div>; }

function Teacher({ user, tab, setTab }) {
  const refs = useRefs();
  const today = useAsync(() => get(`/today-lessons/?role=teacher&user_id=${user.id}`), [user.id]);
  const schedule = useAsync(() => get(`/lessons/${qs({ teacher: user.id })}`), [user.id]);
  const [selected, setSelected] = useState(null);
  if (tab === 'schedule') return <><SectionTitle icon={<CalendarDays />} title="Расписание преподавателя" text="Календарь занятий с перелистыванием по неделям" />{schedule.loading ? <LoadingCard /> : <CalendarView lessons={schedule.data?.results || schedule.data || []} pageable />}</>;
  if (tab === 'journal') return <TeacherJournal user={user} refs={refs} selected={selected} setSelected={setSelected} />;
  if (tab === 'semester') return <Semester user={user} refs={refs} />;
  return <><HeroToday data={today.data} title="Преподавательское расписание" /><div className="metricsGrid"><Metric icon={<CalendarDays />} label="Пар сегодня" value={today.data?.lessons?.length || 0} /><Metric icon={<Users />} label="Групп в системе" value={refs.groups.length} /><Metric icon={<ClipboardCheck />} label="Режим" value="Журнал" hint="+ / − отметки" /></div><SectionTitle icon={<BookOpen />} title="Занятия на сегодня" />{today.loading ? <LoadingCard /> : <LessonCards lessons={today.data?.lessons || []} onOpen={l => { setSelected(l); setTab('journal'); }} />}</>;
}
function TeacherJournal({ user, refs, selected, setSelected }) {
  const [filter, setFilter] = useState({ group: '', subject: '', subgroup: '' });
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const lessons = useAsync(() => get(`/lessons/${qs({ teacher: user.id, group: filter.group, subject: filter.subject, subgroup: filter.subgroup })}`), [user.id, filter.group, filter.subject, filter.subgroup]);
  const students = useMemo(() => refs.students.filter(s => selected && s.group === selected.group && (!selected.subgroup || !selected.subgroup.includes('гр.') || selected.subgroup.includes(`гр.${s.subgroup}`))), [refs.students, selected]);
  useEffect(() => { if (!selected && (lessons.data?.results || lessons.data || [])[0]) setSelected((lessons.data?.results || lessons.data || [])[0]); }, [lessons.data]);
  async function save() {
    if (!selected) return;
    setSaving(true);
    await post('/mark-attendance/', { lesson: selected.id, marked_by: user.id, date: todayIso(), statuses: students.map(s => ({ student: s.id, status: statuses[s.id] || 'present' })) });
    setSaving(false); setStatuses({}); alert('Посещаемость сохранена');
  }
  return <><SectionTitle icon={<ClipboardCheck />} title="Электронный журнал" text="Выберите занятие и отметьте присутствующих студентов" /><Filters><Select label="Группа" value={filter.group} onChange={v => setFilter({ ...filter, group: v })} items={refs.groups} /><SubgroupSelect value={filter.subgroup} onChange={v => setFilter({ ...filter, subgroup: v })} /><Select label="Предмет" value={filter.subject} onChange={v => setFilter({ ...filter, subject: v })} items={refs.subjects} /></Filters><div className="journalLayout"><div className="lessonRail">{lessons.loading ? <LoadingCard /> : (lessons.data?.results || lessons.data || []).map(l => <button key={l.id} className={selected?.id === l.id ? 'chosen' : ''} onClick={() => setSelected(l)}><span>{fullDays[l.day_of_week]} · {l.time}</span><b>{l.subject_title}</b><small>{l.group_number} · {l.subgroup || 'вся группа'}</small></button>)}</div><div className="card journalCard">{selected ? <><div className="journalHead"><div><h2>{selected.subject_title}</h2><p>{selected.group_number} · {selected.time} · {selected.room}</p></div><button className="primaryBtn" onClick={save} disabled={saving}>{saving ? <Loader2 className="spin" /> : <Check />} Сохранить</button></div><div className="markList">{students.map((s, index) => <div className="markRow" key={s.id} style={{ animationDelay: `${index * 20}ms` }}><div><b>{s.full_name}</b><span>{s.subgroup} подгруппа</span></div><div className="markButtons"><button className={(statuses[s.id] || 'present') === 'present' ? 'present on' : 'present'} onClick={() => setStatuses({ ...statuses, [s.id]: 'present' })}><Plus /></button><button className={statuses[s.id] === 'late' ? 'late on' : 'late'} onClick={() => setStatuses({ ...statuses, [s.id]: 'late' })}><Clock /></button><button className={statuses[s.id] === 'absent' ? 'absent on' : 'absent'} onClick={() => setStatuses({ ...statuses, [s.id]: 'absent' })}><Minus /></button></div></div>)}</div></> : <Empty text="Выберите занятие слева" />}</div></div></>;
}
function Semester({ user, refs }) {
  const [filter, setFilter] = useState({ group: '', subject: '', subgroup: '', date_from: '', date_to: '' });
  const matrix = useAsync(() => get(`/semester-matrix/${qs({ teacher: user.id, ...filter })}`), [user.id, filter.group, filter.subject, filter.subgroup, filter.date_from, filter.date_to]);
  return <><SectionTitle icon={<BookOpen />} title="Семестровая ведомость" text="Матрица посещаемости по выбранной группе и предмету" /><Filters><Select label="Группа" value={filter.group} onChange={v => setFilter({ ...filter, group: v })} items={refs.groups} /><SubgroupSelect value={filter.subgroup} onChange={v => setFilter({ ...filter, subgroup: v })} /><Select label="Предмет" value={filter.subject} onChange={v => setFilter({ ...filter, subject: v })} items={refs.subjects} /><label className="field"><span>Дата от</span><input type="date" value={filter.date_from} onChange={e => setFilter({ ...filter, date_from: e.target.value })} /></label><label className="field"><span>Дата до</span><input type="date" value={filter.date_to} onChange={e => setFilter({ ...filter, date_to: e.target.value })} /></label></Filters>{matrix.loading ? <LoadingCard /> : <SemesterMatrix data={matrix.data} />}</>;
}
function SemesterMatrix({ data }) {
  const cols = data?.columns || [], rows = data?.rows || [];
  if (!cols.length || !rows.length) return <Empty text="Для ведомости пока недостаточно отметок" />;
  return <div className="matrixWrap"><table className="matrix"><thead><tr><th>Студент</th><th>Подгр.</th>{cols.map(c => <th key={c.key}>{new Date(c.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}<small>{c.time}</small></th>)}<th>Проп.</th></tr></thead><tbody>{rows.map(r => <tr key={r.student}><td>{r.student}</td><td>{r.subgroup}</td>{r.cells.map((c, i) => <td key={i} className={c === '-' ? 'badCell' : c === '+' ? 'goodCell' : ''}>{c}</td>)}<td><b>{r.absent}</b></td></tr>)}</tbody></table></div>;
}

function Dean({ tab }) {
  const refs = useRefs();
  const [refresh, setRefresh] = useState(0);
  if (tab === 'departments') return <DepartmentsPage refs={refs} refresh={() => setRefresh(x => x + 1)} key={refresh} />;
  return <DeanReports refs={refs} />;
}

function DeanReports({ refs }) {
  const [filter, setFilter] = useState({ report_type: 'faculty', department: '', group: '', subject: '', teacher: '', subgroup: '', date_from: '2026-04-01', date_to: '2026-05-31', compare: '' });
  const analytics = useAsync(() => get(`/analytics/${qs(filter)}`), [filter.report_type, filter.department, filter.group, filter.subject, filter.teacher, filter.subgroup, filter.date_from, filter.date_to]);
  const reportTypes = [
    ['faculty', 'Отчет по факультету'], ['group', 'Посещаемость группы'], ['subject', 'Отчет по дисциплине'], ['absences', 'Журнал пропусков'],
    ['rating', 'Рейтинг студентов'], ['risk', 'Студенты группы риска'], ['teachers', 'Отчет по преподавателям'], ['semester', 'Сводный отчет за семестр'],
    ['late', 'Отчет по опозданиям'], ['compare', 'Сравнение групп']
  ];
  return <>
    <SectionTitle icon={<LayoutDashboard />} title="Панель деканата" text="Отчеты, аналитика и фильтры собраны на одной главной странице" />
    <div className="reportBuilder">
      <div className="builderGrid">
        <label className="field"><span>Тип отчета</span><select value={filter.report_type} onChange={e => setFilter({ ...filter, report_type: e.target.value })}>{reportTypes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <Select label="Кафедра" value={filter.department} onChange={v => setFilter({ ...filter, department: v, group: '' })} items={refs.departments} all="Все кафедры" />
        <Select label="Группа" value={filter.group} onChange={v => setFilter({ ...filter, group: v })} items={refs.groups.filter(g => !filter.department || String(g.department) === String(filter.department))} all="Все группы" />
        <SubgroupSelect value={filter.subgroup} onChange={v => setFilter({ ...filter, subgroup: v })} />
        <Select label="Дисциплина" value={filter.subject} onChange={v => setFilter({ ...filter, subject: v })} items={refs.subjects} all="Все дисциплины" />
        <Select label="Преподаватель" value={filter.teacher} onChange={v => setFilter({ ...filter, teacher: v })} items={refs.teachers} all="Все преподаватели" />
        <label className="field"><span>Период от</span><input type="date" value={filter.date_from} onChange={e => setFilter({ ...filter, date_from: e.target.value })} /></label>
        <label className="field"><span>Период до</span><input type="date" value={filter.date_to} onChange={e => setFilter({ ...filter, date_to: e.target.value })} /></label>
      </div>
      <div className="builderActions"><button className="ghostBtn" onClick={() => setFilter({ report_type: 'faculty', department: '', group: '', subject: '', teacher: '', subgroup: '', date_from: '2026-04-01', date_to: '2026-05-31', compare: '' })}>Сбросить</button><a className="primaryBtn" href={`${API}/export-report-xlsx/${qs(filter)}`}><FileSpreadsheet /> Сформировать XLSX</a></div>
    </div>
    {analytics.loading ? <LoadingCard /> : <ReportPreview type={filter.report_type} data={analytics.data} filter={filter} />}
  </>;
}

function ReportPreview({ type, data, filter }) {
  const total = data?.total || 0, percent = data?.percent || 0, absent = data?.absent || 0, late = data?.late || 0;
  const byStudent = data?.by_student || [], bySubject = data?.by_subject || [], byGroup = data?.by_group || [], byTeacher = data?.by_teacher || [];
  const risky = byStudent.filter(s => s.risk !== 'Норма').sort((a,b) => a.percent - b.percent);
  const rating = [...byStudent].sort((a,b) => b.percent - a.percent);
  return <div className="reportLayout">
    <div className="reportMain card">
      <div className="reportHeader"><div><h2>{reportTitle(type)}</h2><p>Период: {filter.date_from || 'начало'} — {filter.date_to || 'текущая дата'}</p></div><a className="downloadBtn" href={`${API}/export-report-xlsx/${qs(filter)}`}><FileSpreadsheet /> Excel</a></div>
      <div className="miniMetrics"><Metric icon={<TrendingUp />} label="Средняя посещаемость" value={`${percent}%`} /><Metric icon={<Users />} label="Всего отметок" value={total} /><Metric icon={<AlertTriangle />} label="Пропусков" value={absent} /><Metric icon={<Clock />} label="Опозданий" value={late} /></div>
      {type === 'group' && <DataTable heads={['Студент','Посещено','Пропущено','Опоздания','%']} rows={byStudent.map(s => [s.student, s.present, s.absent, s.late || 0, `${s.percent}%`])} />}
      {type === 'subject' && <DataTable heads={['Дисциплина','Всего занятий','Средняя посещаемость']} rows={bySubject.map(s => [s.subject, s.total, `${s.percent}%`])} />}
      {type === 'absences' && <DataTable heads={['Дата','Студент','Группа','Причина']} rows={(data?.absences || []).map(a => [a.date, a.student, a.group, a.reason || 'Не указана'])} />}
      {type === 'rating' && <DataTable heads={['Место','Студент','% посещаемости']} rows={rating.map((s,i) => [i+1, s.student, `${s.percent}%`])} />}
      {type === 'faculty' && <DataTable heads={['Факультет / кафедра','Средняя посещаемость','Количество пропусков']} rows={(data?.by_department || []).map(d => [d.department, `${d.percent}%`, d.absent])} />}
      {type === 'risk' && <DataTable heads={['Студент','Группа','% посещаемости','Статус']} rows={risky.map(s => [s.student, s.group, `${s.percent}%`, s.risk])} />}
      {type === 'teachers' && <DataTable heads={['Преподаватель','Проведено занятий','Заполнено журналов']} rows={byTeacher.map(t => [t.teacher, t.lessons, t.filled_journals])} />}
      {type === 'semester' && <DataTable heads={['Группа','Средняя посещаемость','Лучший студент','Худшая посещаемость']} rows={byGroup.map(g => [g.group, `${g.percent}%`, bestStudent(byStudent, g.group), worstStudent(byStudent, g.group)])} />}
      {type === 'late' && <DataTable heads={['Студент','Количество опозданий']} rows={[...byStudent].sort((a,b)=>(b.late||0)-(a.late||0)).map(s => [s.student, s.late || 0])} />}
      {type === 'compare' && <DataTable heads={['Группа','% посещаемости']} rows={[...byGroup].sort((a,b)=>b.percent-a.percent).map(g => [g.group, `${g.percent}%`])} />}
    </div>
    <aside className="reportSide">
      <div className="card"><h3>Распределение посещаемости</h3>{bySubject.slice(0,4).map(s => <div className="subjectRow compact" key={s.subject}><div><b>{s.subject}</b><span>{s.present}/{s.total} присутствий</span></div><div className="progress"><i style={{ width: `${s.percent}%` }} /></div><strong>{s.percent}%</strong></div>)}</div>
      <div className="card"><h3>Топ дисциплин по пропускам</h3>{bySubject.slice().sort((a,b)=>b.absent-a.absent).slice(0,5).map(s => <div className="teacherReportRow" key={s.subject}><b>{s.subject}</b><span>{s.absent} пропусков</span></div>)}</div>
      <div className="card"><h3>Динамика посещаемости</h3>{(data?.by_week || []).slice(0,8).map(w => <div className="groupLine" key={w.week}><span>{w.week}</span><div className="progress"><i style={{ width: `${w.percent}%` }} /></div><b>{w.percent}%</b></div>)}</div>
    </aside>
  </div>;
}
function reportTitle(type) { return ({ faculty:'Отчет по факультету', group:'Отчет по посещаемости группы', subject:'Отчет по дисциплине', absences:'Журнал пропусков', rating:'Рейтинг посещаемости студентов', risk:'Студенты группы риска', teachers:'Отчет по преподавателям', semester:'Сводный отчет за семестр', late:'Отчет по опозданиям', compare:'Сравнение групп' })[type] || 'Отчет'; }
function bestStudent(items, group) { const arr = items.filter(s => s.group === group).sort((a,b)=>b.percent-a.percent); return arr[0]?.student || '—'; }
function worstStudent(items, group) { const arr = items.filter(s => s.group === group).sort((a,b)=>a.percent-b.percent); return arr[0] ? `${arr[0].student} (${arr[0].percent}%)` : '—'; }
function DataTable({ heads, rows }) { return <div className="reportTableWrap"><table className="reportTable"><thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows?.length ? rows.map((r,i) => <tr key={i}>{r.map((c,j) => <td key={j}>{c}</td>)}</tr>) : <tr><td colSpan={heads.length}><Empty /></td></tr>}</tbody></table></div>; }

function DepartmentsPage({ refs, refresh }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null);
  const departments = refs.departments.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
  const people = refs[mode === 'students' ? 'students' : 'teachers'] || [];
  const list = selected ? people.filter(p => String(p.department) === String(selected.id) || String(p.group && refs.groups.find(g => g.id === p.group)?.department) === String(selected.id)) : [];
  const groups = refs.groups.filter(g => !selected || String(g.department) === String(selected.id));
  async function removeDepartment(dep) { if (confirm(`Удалить кафедру «${dep.name}»?`)) { await request(`/departments/${dep.id}/`, { method: 'DELETE' }); refresh(); } }
  async function removePerson(p) { if (confirm(`Удалить запись «${p.full_name}»?`)) { await request(`/people/${p.id}/`, { method: 'DELETE' }); refresh(); } }
  async function setMonitor(p) { await request(`/people/${p.id}/`, { method: 'PATCH', body: JSON.stringify({ is_monitor: true }), headers: { 'Content-Type': 'application/json' } }); alert('Староста назначен. В группе может быть только один староста.'); refresh(); }
  if (selected && mode) return <>
    <SectionTitle icon={mode === 'students' ? <Users /> : <GraduationCap />} title={mode === 'students' ? `Студенты кафедры` : `Преподаватели кафедры`} text={selected.name} />
    <div className="toolbar"><button className="ghostBtn" onClick={() => setMode(null)}>← К кафедре</button><Select label="Кафедра" value={selected.id} onChange={v => setSelected(refs.departments.find(d => String(d.id) === String(v)))} items={refs.departments} /><Select label="Группа" value="" onChange={() => {}} items={groups} all="Все группы" /><button className="primaryBtn" onClick={() => setForm({ role: mode === 'students' ? 'student' : 'teacher', department: selected.id, group: groups[0]?.id || '', password: '1234' })}><Plus /> Добавить</button></div>
    <div className="directoryTable card"><DataTable heads={mode === 'students' ? ['ФИО','Группа','Подгруппа','Староста','Действия'] : ['ФИО','Должность','Кафедра','Действия']} rows={list.map(p => mode === 'students'
      ? [<button className="linkBtn" onClick={() => setForm({ ...p, view: 'student' })}>{p.full_name}</button>, p.group_number || '—', p.subgroup || '—', p.is_monitor ? 'Да' : <button className="miniBtn" onClick={() => setMonitor(p)}>Назначить</button>, <RowActions onEdit={() => setForm(p)} onDelete={() => removePerson(p)} />]
      : [<button className="linkBtn" onClick={() => setForm({ ...p, view: 'teacher' })}>{p.full_name}</button>, p.position || '—', p.department_name || selected.name, <RowActions onEdit={() => setForm(p)} onDelete={() => removePerson(p)} />]
    )} /></div>
    {form && form.view && <PersonProfile person={form} onClose={() => setForm(null)} />}
    {form && !form.view && <PersonForm person={form} groups={groups} departments={refs.departments} onClose={() => setForm(null)} onSaved={refresh} />}
  </>;
  if (selected) return <>
    <SectionTitle icon={<Building2 />} title={selected.name} text="Выберите раздел кафедры" />
    <div className="departmentHero card"><div><b>Высшая школа экономики и права</b><p>Кафедра ведет учебную работу, преподавателей, студентов и группы. Здесь можно добавлять, редактировать и удалять записи.</p></div><RowActions onEdit={() => setForm(selected)} onDelete={() => removeDepartment(selected)} /></div>
    <div className="choiceGrid"><button onClick={() => setMode('teachers')}><GraduationCap /><b>Преподаватели кафедры</b><span>Список, карточка и расписание преподавателя</span></button><button onClick={() => setMode('students')}><Users /><b>Студенты кафедры</b><span>Информация, расписание и назначение старосты</span></button></div>
    {form && <DepartmentForm department={form} onClose={() => setForm(null)} onSaved={refresh} />}
  </>;
  return <>
    <SectionTitle icon={<Building2 />} title="Кафедры" text="Структура Набережночелнинского института КФУ" />
    <div className="toolbar"><div className="searchBox"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск кафедры" /></div><button className="primaryBtn" onClick={() => setForm({ name: '', institute: 'Набережночелнинский институт КФУ', head_name: '' })}><Plus /> Добавить кафедру</button></div>
    <div className="departmentList">{departments.map(d => <button key={d.id} onClick={() => setSelected(d)}><Building2 /><div><b>{d.name}</b><span>{d.head_name || 'Заведующий не указан'}</span></div><ChevronRight /></button>)}</div>
    {form && <DepartmentForm department={form} onClose={() => setForm(null)} onSaved={refresh} />}
  </>;
}
function RowActions({ onEdit, onDelete }) { return <div className="rowActions"><button onClick={onEdit}><Edit3 /></button><button onClick={onDelete}><Trash2 /></button></div>; }

function DepartmentForm({ department, onClose, onSaved }) {
  const [form, setForm] = useState(department);
  async function save() { const path = form.id ? `/departments/${form.id}/` : '/departments/'; await request(path, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } }); onSaved(); onClose(); }
  return <Modal title="Кафедра" onClose={onClose}><label>Название<input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Заведующий<input value={form.head_name || ''} onChange={e => setForm({ ...form, head_name: e.target.value })} /></label><label>Институт<input value={form.institute || ''} onChange={e => setForm({ ...form, institute: e.target.value })} /></label><button className="primaryBtn" onClick={save}><Save /> Сохранить</button></Modal>;
}
function PersonForm({ person, groups, departments, onClose, onSaved }) {
  const [form, setForm] = useState(person);
  async function save() { const payload = { full_name: form.full_name, role: form.role, login: form.login || `u${Date.now()}`, password: form.password || '1234', group: form.role === 'student' ? form.group : null, department: form.role === 'teacher' ? form.department : (groups.find(g => String(g.id) === String(form.group))?.department || form.department), position: form.position || '', subgroup: form.subgroup || '', is_monitor: !!form.is_monitor }; const path = form.id ? `/people/${form.id}/` : '/people/'; await request(path, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }); onSaved(); onClose(); }
  return <Modal title={form.role === 'student' ? 'Студент' : 'Преподаватель'} onClose={onClose}><label>ФИО<input value={form.full_name || ''} onChange={e => setForm({ ...form, full_name: e.target.value })} /></label>{form.role === 'student' ? <><label>Группа<select value={form.group || ''} onChange={e => setForm({ ...form, group: e.target.value })}>{groups.map(g => <option key={g.id} value={g.id}>{g.number}</option>)}</select></label><label>Подгруппа<select value={form.subgroup || ''} onChange={e => setForm({ ...form, subgroup: e.target.value })}><option value="">—</option><option value="1">1</option><option value="2">2</option></select></label><label className="checkLine"><input type="checkbox" checked={!!form.is_monitor} onChange={e => setForm({ ...form, is_monitor: e.target.checked })} /> Назначить старостой</label></> : <><label>Кафедра<select value={form.department || ''} onChange={e => setForm({ ...form, department: e.target.value })}>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label>Должность<input value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} /></label></>}<label>Логин<input value={form.login || ''} onChange={e => setForm({ ...form, login: e.target.value })} /></label><button className="primaryBtn" onClick={save}><Save /> Сохранить</button></Modal>;
}
function PersonProfile({ person, onClose }) {
  const lessons = useAsync(() => get(`/lessons/${qs(person.role === 'student' ? { group: person.group, subgroup: person.subgroup } : { teacher: person.id })}`), [person.id]);
  return <Modal title={person.full_name} onClose={onClose} wide><div className="profileInfo"><div className="avatar big">{person.full_name?.slice(0,1)}</div><div><h2>{person.full_name}</h2><p>{person.role === 'student' ? `${person.group_number} · ${person.subgroup || '—'} подгруппа` : person.position}</p>{person.is_monitor && <b className="monitor"><UserCheck /> Староста группы</b>}</div></div><h3>Расписание</h3>{lessons.loading ? <LoadingCard /> : <CalendarView lessons={lessons.data?.results || lessons.data || []} pageable />}</Modal>;
}
function Modal({ title, children, onClose, wide }) { return <div className="drawer"><div className={wide ? 'drawerCard wideModal' : 'drawerCard'}><button className="close" onClick={onClose}><X /></button><h2>{title}</h2>{children}</div></div>; }

createRoot(document.getElementById('root')).render(<App />);
