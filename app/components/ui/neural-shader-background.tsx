'use client';

export default function NeuralShaderBackground() {
  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden" aria-hidden="true">
      {/* Background gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100"></div>
    </div>
  );
}