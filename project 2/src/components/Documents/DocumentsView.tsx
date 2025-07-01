import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Upload, Download, Search, Filter, File, Image, Archive, X, CheckCircle, AlertCircle, Eye, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Document {
  id: string
  name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  case_id?: string
  case_name?: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  upload_progress?: number
  error_message?: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
}

const DocumentsView: React.FC = () => {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dragActive, setDragActive] = useState(false)
  const [selectedCase, setSelectedCase] = useState<string>('none')
  const [cases, setCases] = useState<any[]>([])

  useEffect(() => {
    fetchDocuments()
    fetchCases()
  }, [user])

  const fetchDocuments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          cases (
            title
          )
        `)
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
      } else {
        const documentsWithCaseNames = (data || []).map(doc => ({
          ...doc,
          case_name: doc.cases?.title,
          status: 'ready' as const
        }))
        setDocuments(documentsWithCaseNames)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCases = async () => {
    if (!user) return

    try {
      // First get the client record
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (client) {
        const { data: casesData, error } = await supabase
          .from('cases')
          .select('id, title')
          .eq('client_id', client.id)

        if (!error && casesData) {
          setCases(casesData)
        }
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB'
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-zip-compressed'
    ]

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, Excel, text, image, or ZIP files.'
    }

    return null
  }

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      } else {
        resolve(null)
      }
    })
  }

  const handleFiles = async (files: File[]) => {
    const validFiles: UploadingFile[] = []

    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        // Show error for invalid files
        const invalidFile: UploadingFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'error',
          error
        }
        setUploadingFiles(prev => [...prev, invalidFile])
        continue
      }

      const preview = await createFilePreview(file)
      const uploadingFile: UploadingFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
        preview
      }

      validFiles.push(uploadingFile)
    }

    if (validFiles.length > 0) {
      setUploadingFiles(prev => [...prev, ...validFiles])
      
      // Upload each valid file
      for (const uploadingFile of validFiles) {
        uploadFile(uploadingFile)
      }
    }
  }

  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      const { file } = uploadingFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `documents/${user!.id}/${fileName}`

      // Update progress to show upload starting
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadingFile.id ? { ...f, progress: 10 } : f
      ))

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Update progress
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadingFile.id ? { ...f, progress: 70 } : f
      ))

      // Save document metadata to database
      const documentData = {
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user!.id,
        case_id: selectedCase !== 'none' ? selectedCase : null
      }

      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select(`
          *,
          cases (
            title
          )
        `)
        .single()

      if (dbError) {
        throw dbError
      }

      // Update progress to complete
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadingFile.id ? { ...f, progress: 100, status: 'success' } : f
      ))

      // Add to documents list
      const newDocument: Document = {
        ...document,
        case_name: document.cases?.title,
        status: 'ready'
      }
      setDocuments(prev => [newDocument, ...prev])

      // Remove from uploading files after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id))
      }, 2000)

    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadingFile.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ))
    }
  }

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) {
        throw error
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = document.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const deleteDocument = async (document: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)

      if (dbError) {
        throw dbError
      }

      // Remove from local state
      setDocuments(prev => prev.filter(d => d.id !== document.id))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes('word') || type.includes('document')) return <File className="h-8 w-8 text-blue-500" />
    if (type.includes('image')) return <Image className="h-8 w-8 text-green-500" />
    if (type.includes('zip')) return <Archive className="h-8 w-8 text-purple-500" />
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'uploading':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.case_name && doc.case_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || doc.mime_type.includes(typeFilter)
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Manage and access your legal documents securely</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="image">Images</option>
              <option value="zip">Archives</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associate with Case (Optional)
                </label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No specific case</option>
                  {cases.map(case_ => (
                    <option key={case_.id} value={case_.id}>{case_.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h4>
            <p className="text-gray-600 mb-4">Drag and drop files here, or click to select files</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip"
            />
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              Choose Files
            </motion.label>
            <div className="mt-4 text-sm text-gray-500">
              <p>• Supported formats: PDF, Word, Excel, Text, Images, ZIP</p>
              <p>• Maximum file size: 50MB per file</p>
              <p>• Multiple files can be uploaded at once</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Uploading Files */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading Files</h3>
              <div className="space-y-3">
                {uploadingFiles.map((uploadingFile) => (
                  <div key={uploadingFile.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {uploadingFile.preview ? (
                          <img src={uploadingFile.preview} alt="" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          getFileIcon(uploadingFile.file.type)
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{uploadingFile.file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(uploadingFile.file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadingFile.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <button
                          onClick={() => removeUploadingFile(uploadingFile.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadingFile.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'error' && uploadingFile.error && (
                      <p className="text-sm text-red-600 mt-1">{uploadingFile.error}</p>
                    )}

                    {uploadingFile.status === 'success' && (
                      <p className="text-sm text-green-600 mt-1">Upload completed successfully!</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started'
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.mime_type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(document.file_size)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </span>
              </div>
              
              <div className="mb-4">
                {document.case_name && (
                  <p className="text-sm text-gray-600 mb-1">Case: {document.case_name}</p>
                )}
                <p className="text-sm text-gray-500">Uploaded: {new Date(document.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadDocument(document)}
                  className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Eye className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteDocument(document)}
                  className="bg-red-50 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentsView