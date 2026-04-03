import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function SettingsPage() {
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState('myapp_db');
  const [dbUser, setDbUser] = useState('admin');
  const [dbPass, setDbPass] = useState('••••••••');
  const [showPass, setShowPass] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');
  const [notifyErrors, setNotifyErrors] = useState(true);
  const [notifySync, setNotifySync] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saved, setSaved] = useState(false);

  const testConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('success');
    }, 1800);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 transition-all duration-300"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '999px',
        background: value ? 'hsl(82,100%,55%)' : 'hsla(237,25%,22%,0.8)',
        border: value ? '1px solid hsl(82,100%,55%)' : '1px solid hsla(237,25%,28%,0.8)',
        boxShadow: value ? '0 0 10px hsla(82,100%,55%,0.3)' : 'none',
      }}
    >
      <span
        className="absolute top-0.5 transition-all duration-300"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          left: value ? '21px' : '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="glass rounded-2xl overflow-hidden mb-4 animate-fade-in-up">
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{ borderBottom: '1px solid hsla(237,25%,22%,0.4)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'hsla(82,100%,55%,0.1)' }}
        >
          <Icon name={icon} size={16} style={{ color: 'hsl(82,100%,55%)' }} />
        </div>
        <span className="font-semibold text-sm" style={{ color: 'hsl(210,40%,90%)' }}>{title}</span>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-6 py-3" style={{ borderBottom: '1px solid hsla(237,25%,20%,0.3)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'hsl(210,40%,88%)' }}>{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: 'hsl(215,20%,50%)' }}>{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const Input = ({ value, onChange, type = 'text', placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="search-input text-right"
      style={{ width: '180px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
    />
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Настройки</h1>
        <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>Администрирование и конфигурация системы</p>
      </div>

      {/* MySQL */}
      <Section title="Подключение MySQL" icon="Database">
        <Field label="Хост" hint="IP-адрес или домен сервера">
          <Input value={dbHost} onChange={setDbHost} placeholder="localhost" />
        </Field>
        <Field label="Порт">
          <Input value={dbPort} onChange={setDbPort} placeholder="3306" />
        </Field>
        <Field label="База данных">
          <Input value={dbName} onChange={setDbName} placeholder="my_database" />
        </Field>
        <Field label="Пользователь">
          <Input value={dbUser} onChange={setDbUser} placeholder="root" />
        </Field>
        <Field label="Пароль">
          <div className="flex items-center gap-2">
            <Input
              value={showPass ? 'admin1234' : dbPass}
              onChange={setDbPass}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'hsl(215,20%,50%)', background: 'hsla(237,25%,18%,0.6)' }}
            >
              <Icon name={showPass ? 'EyeOff' : 'Eye'} size={14} />
            </button>
          </div>
        </Field>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={testConnection}
            className="btn-ghost flex items-center gap-2"
            disabled={testing}
          >
            <Icon
              name="Plug"
              size={14}
              style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }}
            />
            {testing ? 'Проверяем...' : 'Тест соединения'}
          </button>
          {testResult === 'success' && (
            <div className="badge-sync animate-scale-in">
              <Icon name="CheckCircle2" size={12} />
              Соединение успешно
            </div>
          )}
          {testResult === 'error' && (
            <div className="badge-error animate-scale-in">
              <Icon name="XCircle" size={12} />
              Нет соединения
            </div>
          )}
        </div>
      </Section>

      {/* Sync */}
      <Section title="Синхронизация" icon="RefreshCw">
        <Field label="Автоматическая синхронизация" hint="Синхронизировать данные по расписанию">
          <Toggle value={autoSync} onChange={setAutoSync} />
        </Field>
        <Field label="Интервал синхронизации" hint="Минут между синхронизациями">
          <div className="flex items-center gap-2">
            <Input value={syncInterval} onChange={setSyncInterval} placeholder="15" />
            <span className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>мин</span>
          </div>
        </Field>
        <Field label="Конфликты" hint="Что делать при конфликте данных">
          <select
            className="search-input text-right font-mono text-xs"
            style={{ width: '160px', cursor: 'pointer' }}
          >
            <option value="overwrite">Перезаписать</option>
            <option value="skip">Пропустить</option>
            <option value="ask">Спросить</option>
          </select>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Уведомления" icon="Bell">
        <Field label="Уведомлять об ошибках" hint="Получать алерты при сбоях синхронизации">
          <Toggle value={notifyErrors} onChange={setNotifyErrors} />
        </Field>
        <Field label="Уведомлять о синхронизации" hint="Сообщение о каждой успешной синхронизации">
          <Toggle value={notifySync} onChange={setNotifySync} />
        </Field>
        <Field label="Email для уведомлений">
          <input
            type="email"
            placeholder="admin@example.com"
            className="search-input"
            style={{ width: '220px', fontSize: '13px' }}
          />
        </Field>
      </Section>

      {/* Danger zone */}
      <div className="glass rounded-2xl overflow-hidden mb-6 animate-fade-in-up" style={{ border: '1px solid hsla(0,72%,55%,0.2)' }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid hsla(0,72%,55%,0.15)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsla(0,72%,55%,0.12)' }}>
            <Icon name="AlertTriangle" size={16} style={{ color: 'hsl(0,72%,60%)' }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'hsl(0,72%,65%)' }}>Опасная зона</span>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          <button className="text-left w-full flex items-center justify-between py-2 text-sm transition-all" style={{ color: 'hsl(215,20%,60%)' }}>
            <span>Очистить историю изменений</span>
            <Icon name="Trash2" size={14} style={{ color: 'hsl(0,72%,55%)' }} />
          </button>
          <div className="h-px" style={{ background: 'hsla(237,25%,22%,0.4)' }} />
          <button className="text-left w-full flex items-center justify-between py-2 text-sm transition-all" style={{ color: 'hsl(215,20%,60%)' }}>
            <span>Сбросить все настройки</span>
            <Icon name="RotateCcw" size={14} style={{ color: 'hsl(0,72%,55%)' }} />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end animate-fade-in-up">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
          style={saved ? { background: 'hsl(82,100%,45%)', boxShadow: '0 0 24px hsla(82,100%,55%,0.5)' } : {}}
        >
          <Icon name={saved ? 'CheckCircle2' : 'Save'} size={15} />
          {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}
