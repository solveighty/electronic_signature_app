import { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [documents, setDocuments] = useState<Array<{ id: number; name: string; status: string }>>([])
  const {setToken} = useAuth(); 
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0]; 

    // Validación en frontend: solo PDF
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al subir archivo");

      setDocuments((prevDocs) => [
        ...prevDocs,
        {
          id: Date.now(),
          name: result.file.originalname,
          status: "Pendiente de firma",
        },
      ]);
    } catch (error: any) {
      alert(error.message);
    }
  }
};

  const handleLogout = () => {
    setToken(null); // Clear the token in context
    if(setToken === null){
      navigate('/login'); // Redirect to login page
    }
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Firma Electrónica</h1>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Sube tus documentos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                PDF, DOC, DOCX hasta 10MB
              </p>
              <div className="mt-6">
                <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                  Seleccionar archivos
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Documentos subidos
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary truncate">
                            {doc.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {doc.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard 