import { LoginBrandPanel } from './components/LoginBrandPanel';
import { LoginFormPanel } from './components/LoginFormPanel';
import { useLoginPage } from './hooks/useLoginPage';

export default function Login() {
  const {
    error,
    handleDemoLogin,
    handleSubmit,
    loading,
    mode,
    selectMode,
    success,
    updateValue,
    values,
  } = useLoginPage();

  return (
    <div className="min-h-screen w-full flex bg-[#fffdfa] relative overflow-hidden py-12 px-4 justify-center items-center">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-3xl opacity-60 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#b5d9f2]/10 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-[1000px] bg-white/60 backdrop-blur-md border border-[#b5d9f2]/30 rounded-[40px] shadow-2xl p-6 md:p-10 lg:p-12 flex flex-col md:flex-row gap-10 items-stretch z-10">
        <LoginBrandPanel loading={loading} onDemoLogin={handleDemoLogin} />
        <LoginFormPanel
          error={error}
          loading={loading}
          mode={mode}
          onModeChange={selectMode}
          onSubmit={handleSubmit}
          onValueChange={updateValue}
          success={success}
          values={values}
        />
      </div>
    </div>
  );
}
