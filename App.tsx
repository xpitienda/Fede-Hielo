
import React, { useState, useRef } from 'react';
import { GeminiImageService } from './services/geminiService';
import { GenerationStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Una criatura humanoide hecha enteramente de agua líquida cristalina, en una pose dinámica y artística. El agua tiene burbujas internas y refracciones de luz. Fondo de naturaleza mística desenfocado. Calidad cinematográfica, 8k, ultra detallado.");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSequence = async () => {
    setStatus(GenerationStatus.GENERATING);
    setError(null);
    setGeneratedImages([]); // Limpiar secuencia anterior
    const newImages: string[] = [];
    
    const service = new GeminiImageService();
    const TOTAL_IMAGES = 7;

    try {
      for (let i = 0; i < TOTAL_IMAGES; i++) {
        setCurrentIndex(i + 1);
        
        // Añadimos una variación al prompt para que cada imagen de la secuencia sea única
        const sequentialPrompt = `${prompt} Variation ${i + 1}: focus on different lighting and water splashes.`;
        
        const imageUrl = await service.generateWaterManImage(sequentialPrompt, imagePreview || undefined);
        newImages.push(imageUrl);
        
        // Actualizamos el estado progresivamente para que el usuario vea las imágenes una tras otra
        setGeneratedImages([...newImages]);
      }
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(`Error en la imagen ${newImages.length + 1}: ${err.message || "Error de conexión"}`);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const activeImage = generatedImages.length > 0 ? generatedImages[generatedImages.length - 1] : null;

  return (
    <div className="min-h-screen pb-20 bg-[#050a0a]">
      <header className="sticky top-0 z-50 glass-panel border-b border-teal-500/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 water-gradient rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)]">
              <span className="text-white font-black">L²</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">LiquidLife Art <span className="text-teal-500 font-normal">Sequence</span></h1>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400 font-medium">
            Modo Secuencial Activo (7x)
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Panel de Control */}
        <section className="lg:col-span-4 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">Crónica de Agua</h2>
            <p className="text-teal-100/60 leading-relaxed">
              Genera una secuencia evolutiva de 7 obras maestras. Cada evento visual es único.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-[2rem] space-y-6 shadow-2xl border border-white/5">
            <div className="space-y-3">
              <label className="text-sm font-bold text-teal-400 uppercase tracking-widest">Base de Referencia</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-40 w-full border-2 border-dashed border-teal-500/20 rounded-2xl overflow-hidden cursor-pointer bg-black/40 flex items-center justify-center transition-all hover:border-teal-500/50"
              >
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Referencia" />
                ) : (
                  <div className="text-center opacity-40">
                    <p className="text-xs font-medium">Sube una imagen guía</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-teal-400 uppercase tracking-widest">Prompt del Artista</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-sm text-teal-50 focus:border-teal-500/50 outline-none resize-none transition-all"
              />
            </div>

            <button 
              onClick={handleGenerateSequence}
              disabled={status === GenerationStatus.GENERATING}
              className={`w-full py-5 rounded-2xl font-black text-lg flex flex-col items-center justify-center gap-1 transition-all ${
                status === GenerationStatus.GENERATING 
                ? 'bg-teal-900/40 text-teal-500 cursor-not-allowed' 
                : 'water-gradient text-white shadow-xl hover:scale-[1.02] active:scale-95'
              }`}
            >
              {status === GenerationStatus.GENERATING ? (
                <>
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generando {currentIndex} de 7</span>
                  </div>
                  <div className="w-48 h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-teal-400 transition-all duration-500" 
                      style={{ width: `${(currentIndex / 7) * 100}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <span>Generar Obra Maestra (x7)</span>
                  <span className="text-[10px] opacity-70 uppercase tracking-tighter">Secuencia Completa</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-xs flex gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Visualización Principal */}
        <section className="lg:col-span-5 relative">
          <div className="sticky top-28">
            <div className="aspect-[9/16] max-h-[75vh] mx-auto bg-black rounded-[3rem] border-[10px] border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative group">
              {status === GenerationStatus.GENERATING && !activeImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050a0a]/95 z-10 p-8 text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-teal-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white">Iniciando Cascada</h3>
                  <p className="text-teal-400/50 text-xs mt-2">Preparando los 7 eventos de renderizado...</p>
                </div>
              ) : activeImage ? (
                <>
                  <img 
                    key={activeImage}
                    src={activeImage} 
                    className="w-full h-full object-cover animate-fade-in" 
                    alt="Arte Generado" 
                  />
                  {/* Botón de descarga principal mejorado */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] p-4 glass-panel rounded-2xl flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter">Obra Maestra</span>
                      <span className="text-xs text-white/70">Fondo 9:16 HD</span>
                    </div>
                    <a 
                      href={activeImage} 
                      download={`LiquidLife_Active_${generatedImages.length}.png`} 
                      className="p-3 bg-teal-500 text-black rounded-xl hover:bg-teal-400 transition-colors shadow-lg active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-teal-100/10 p-12 text-center">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-lg">Secuencia vacía</p>
                </div>
              )}

              {activeImage && (
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-teal-400 text-[10px] font-black px-3 py-1 rounded-full border border-teal-500/30">
                  EVENTO {generatedImages.length} / 7
                </div>
              )}
            </div>
            <div className="w-2/3 h-10 bg-teal-500/5 blur-[70px] mx-auto mt-[-20px] rounded-full"></div>
          </div>
        </section>

        {/* Galería Secuencial */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest">Línea de Tiempo</h3>
            <span className="text-[10px] text-teal-500/40 font-bold uppercase tracking-tighter">Descarga Individual</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar pb-10">
            {Array.from({ length: 7 }).map((_, idx) => {
              const img = generatedImages[idx];
              const isGenerating = status === GenerationStatus.GENERATING && idx === generatedImages.length;
              
              return (
                <div 
                  key={idx}
                  className={`group/thumb relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                    img ? 'border-teal-500/40 shadow-lg' : isGenerating ? 'border-teal-500 animate-pulse bg-teal-900/10' : 'border-white/5 bg-zinc-900/50'
                  }`}
                >
                  {img ? (
                    <>
                      <img src={img} className="w-full h-full object-cover" alt={`Secuencia ${idx + 1}`} />
                      {/* Overlay con botón de descarga */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={img} 
                          download={`LiquidLife_Sequence_${idx + 1}.png`} 
                          className="p-4 bg-teal-500 text-black rounded-full shadow-2xl hover:bg-teal-400 transform scale-75 group-hover/thumb:scale-100 transition-all duration-300"
                          title="Descargar esta imagen"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-teal-400 px-2 py-0.5 rounded-lg border border-white/10 font-bold">
                        #{idx + 1}
                      </div>
                    </>
                  ) : isGenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                       <div className="w-4 h-4 bg-teal-500 rounded-full animate-ping"></div>
                       <span className="text-[8px] text-teal-500 font-bold uppercase">Creando...</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5 font-black text-2xl">
                      {idx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(45, 212, 191, 0.2); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
