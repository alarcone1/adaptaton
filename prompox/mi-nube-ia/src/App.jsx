import React, { useState, useEffect } from 'react';
import {
  User,
  Server,
  Cloud,
  Database,
  BrainCircuit,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HardDrive
} from 'lucide-react';

// Definición de los pasos de la animación
const steps = [
  {
    id: 0,
    title: "Infraestructura Base",
    description: "Vista general del sistema. Tenemos un Usuario, y un Servidor Físico ejecutando Proxmox VE. Dentro de Proxmox, coexisten TrueNAS (Almacenamiento) y la App de IA (Procesamiento).",
    highlight: [],
    packetState: 'hidden'
  },
  {
    id: 1,
    title: "Paso 1: Subida de Archivo",
    description: "El usuario sube un archivo (dataset, imagen, documento) a su Nube Privada. El archivo viaja por la red hacia TrueNAS.",
    highlight: ['user', 'truenas'],
    packetState: 'upload' // User -> TrueNAS
  },
  {
    id: 2,
    title: "Paso 2: Gestión en TrueNAS",
    description: "TrueNAS Scale recibe el archivo y lo asegura en el pool ZFS utilizando el disco físico (passthrough). Los datos están seguros.",
    highlight: ['truenas', 'disk'],
    packetState: 'stored' // At TrueNAS
  },
  {
    id: 3,
    title: "Paso 3: Acceso Local (SMB/NFS)",
    description: "La Máquina Virtual de IA solicita acceso al archivo. Gracias al montaje SMB/NFS local, la transferencia es inmediata dentro del mismo servidor.",
    highlight: ['truenas', 'app', 'connection'],
    packetState: 'transfer' // TrueNAS -> App
  },
  {
    id: 4,
    title: "Paso 4: Procesamiento IA",
    description: "La Inteligencia Artificial procesa los datos localmente. El 'cerebro' analiza la información utilizando los recursos asignados por Proxmox.",
    highlight: ['app'],
    packetState: 'processing' // Spinning at App
  },
  {
    id: 5,
    title: "Paso 5: Resultados",
    description: "La aplicación web obtiene el resultado y se lo presenta de vuelta al usuario en su interfaz.",
    highlight: ['app', 'user'],
    packetState: 'result' // App -> User
  }
];

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Control del Auto-Play
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false); // Stop at end
          return prev;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Ayudante para verificar si un elemento debe estar resaltado
  const isHighlighted = (id) => steps[currentStep].highlight.includes(id);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans flex flex-col items-center justify-center">

      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
          Arquitectura: Nube Privada + IA Local
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Integración de TrueNAS Scale y Desarrollo IA sobre Proxmox VE
        </p>
      </header>

      {/* Main Animation Stage */}
      <div className="relative w-full max-w-5xl bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] p-4 md:p-10">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        {/* --- ARCHITECTURE NODES --- */}

        {/* 1. USER NODE (Top Left) */}
        <div className={`absolute top-[10%] left-[5%] md:left-[10%] transition-all duration-500 ${isHighlighted('user') ? 'scale-110 opacity-100' : 'opacity-70'}`}>
          <div className="flex flex-col items-center gap-2">
            <div className={`p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 z-20 relative`}>
              <User size={32} className="text-white" />
            </div>
            <span className="font-semibold text-sm bg-slate-900/80 px-3 py-1 rounded-full border border-slate-600">Usuario</span>
          </div>
        </div>

        {/* 2. PROXMOX CONTAINER (The Big Server) */}
        <div className="absolute bottom-[5%] right-[5%] w-[85%] h-[70%] md:w-[75%] md:h-[75%] bg-slate-900/60 border-2 border-orange-500/50 rounded-xl p-6 transition-all duration-500 backdrop-blur-sm">
          {/* Proxmox Label */}
          <div className="absolute -top-4 left-8 bg-orange-600 text-white px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
            <Server size={16} /> Proxmox VE (Hipervisor)
          </div>

          {/* Hardware Layer Hint */}
          <div className="absolute bottom-2 right-4 flex items-center gap-2 text-orange-500/40 text-xs font-mono">
            <Server size={12} /> HARDWARE BARE METAL
          </div>

          {/* INTERNAL VMS */}
          <div className="w-full h-full flex items-center justify-around relative">

            {/* VM 1: TRUENAS (Left inside Proxmox) */}
            <div className={`relative p-6 rounded-lg border-2 transition-all duration-500 w-1/3 h-3/4 flex flex-col items-center justify-center gap-4
              ${isHighlighted('truenas') ? 'border-blue-400 bg-blue-900/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-slate-600 bg-slate-800/40'}`}>

              <div className="text-center">
                <div className="bg-blue-600 p-3 rounded-lg mb-2 inline-block">
                  <Database size={32} className="text-white" />
                </div>
                <h3 className="font-bold text-blue-300">TrueNAS VM</h3>
                <p className="text-xs text-slate-400 mt-1">Nube Privada (ZFS)</p>
              </div>

              {/* PCI Passthrough Disk */}
              <div className={`mt-4 flex flex-col items-center transition-all duration-500 ${isHighlighted('disk') ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                <HardDrive size={24} className="text-slate-300" />
                <span className="text-[10px] text-slate-500 font-mono mt-1">HBA Passthrough</span>
              </div>
            </div>

            {/* SMB/NFS PIPE (Connection) */}
            <div className="flex-1 h-2 bg-slate-700 relative mx-2 rounded-full overflow-hidden">
              <div className={`absolute inset-0 bg-green-400 transition-transform duration-1000 ${isHighlighted('connection') ? 'translate-x-0' : '-translate-x-full'}`}></div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-green-400 bg-slate-900 px-2 py-0.5 rounded border border-green-900">
                SMB / NFS
              </div>
            </div>

            {/* VM 2: AI APP (Right inside Proxmox) */}
            <div className={`relative p-6 rounded-lg border-2 transition-all duration-500 w-1/3 h-3/4 flex flex-col items-center justify-center gap-4
              ${isHighlighted('app') ? 'border-purple-400 bg-purple-900/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-slate-600 bg-slate-800/40'}`}>

              <div className="text-center">
                <div className={`bg-purple-600 p-3 rounded-lg mb-2 inline-block transition-all duration-500 ${currentStep === 4 ? 'animate-pulse' : ''}`}>
                  {currentStep === 4 ? <BrainCircuit size={32} className="text-white animate-spin-slow" /> : <BrainCircuit size={32} className="text-white" />}
                </div>
                <h3 className="font-bold text-purple-300">Dev / AI VM</h3>
                <p className="text-xs text-slate-400 mt-1">Docker / Python</p>
              </div>
            </div>

          </div>
        </div>

        {/* --- ANIMATED PACKET (The File) --- */}
        <DataPacket step={steps[currentStep].packetState} />

      </div>

      {/* Controls & Description Panel */}
      <div className="w-full max-w-3xl mt-8 space-y-6">

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reiniciar"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-4 rounded-full font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Text Description */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/50 min-h-[140px] transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-blue-500/30">
              PASO {currentStep} DE {steps.length - 1}
            </span>
            <h2 className="text-xl font-bold text-white">{steps[currentStep].title}</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

      </div>
    </div>
  );
};

// Sub-component for the moving data packet
const DataPacket = ({ step }) => {
  // Define positions based on step
  // We use inline styles for coordinates to simulate movement between the nodes defined in the main layout
  // Coordinates are roughly calculated percentages based on the parent container 

  let style = { opacity: 0 };
  let icon = <FileText size={20} />;
  let label = "";

  switch (step) {
    case 'hidden':
      style = { top: '10%', left: '10%', opacity: 0 };
      break;
    case 'upload':
      // Moving from User (10,10) to TrueNAS (approx bottom-left area inside Proxmox)
      // Proxmox starts at top 30% (calc). TrueNAS is roughly at top 55%, left 30%
      style = {
        top: '55%',
        left: '30%',
        opacity: 1,
        transition: 'all 2s ease-in-out'
      };
      label = "Subiendo...";
      break;
    case 'stored':
      // Staying at TrueNAS
      style = {
        top: '55%',
        left: '30%',
        opacity: 1,
        transform: 'scale(0.8)'
      };
      label = "Guardado";
      break;
    case 'transfer':
      // TrueNAS (55,30) to App (55, 75)
      style = {
        top: '55%',
        left: '75%',
        opacity: 1,
        transition: 'all 1.5s ease-in-out'
      };
      label = "SMB Transfer";
      break;
    case 'processing':
      // At App
      style = {
        top: '55%',
        left: '75%',
        opacity: 1,
        transform: 'scale(1.2)'
      };
      icon = <BrainCircuit size={24} className="animate-spin" />;
      label = "Procesando";
      break;
    case 'result':
      // App (55, 75) back to User (10, 10)
      style = {
        top: '14%',
        left: '14%',
        opacity: 1,
        transition: 'all 2s ease-in-out',
        color: '#4ade80' // Green
      };
      icon = <CheckCircle size={24} />;
      label = "Resultado";
      break;
    default:
      style = { opacity: 0 };
  }

  return (
    <div
      className="absolute z-30 flex flex-col items-center justify-center pointer-events-none"
      style={style}
    >
      <div className="bg-white text-slate-900 p-2 rounded-lg shadow-xl shadow-white/20">
        {icon}
      </div>
      {label && (
        <span className="mt-2 text-xs font-bold bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-md whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};

export default App;