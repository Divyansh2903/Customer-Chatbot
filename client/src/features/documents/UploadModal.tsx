import { useRef, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/toast'
import { getErrorMessage } from '../../lib/api'
import { useUploadDocument } from './hooks'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

const ALLOWED_EXT = ['pdf', 'docx', 'xlsx', 'csv', 'txt']
const ACCEPT = '.pdf,.docx,.xlsx,.csv,.txt'
const MAX_SIZE = 25 * 1024 * 1024

function validate(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXT.includes(ext)) return `Unsupported type (.${ext})`
  if (file.size > MAX_SIZE) return 'Exceeds 25 MB'
  return null
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const uploadMutation = useUploadDocument()

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)

    const valid: File[] = []
    for (const file of files) {
      const error = validate(file)
      if (error) toast.error(`${file.name}: ${error}`)
      else valid.push(file)
    }
    if (valid.length === 0) return

    setUploading(true)
    let ok = 0
    for (const file of valid) {
      try {
        await uploadMutation.mutateAsync(file)
        ok++
      } catch (err) {
        toast.error(`${file.name}: ${getErrorMessage(err, 'Upload failed')}`)
      }
    }
    setUploading(false)
    if (ok > 0) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded — processing started`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Source" maxWidth="max-w-lg">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!uploading) void handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={
          'flex flex-col items-center justify-center text-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 cursor-pointer transition-colors ' +
          (dragging
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant hover:bg-surface-container-low')
        }
      >
        {uploading ? (
          <>
            <Spinner size={32} />
            <p className="text-sm text-on-surface-variant mt-2">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="upload_file" size={26} />
            </div>
            <p className="text-sm font-medium text-on-surface mt-2">
              Drag &amp; drop files, or <span className="text-primary">browse</span>
            </p>
            <p className="font-mono text-[11px] text-on-surface-variant">
              PDF, DOCX, XLSX, CSV, TXT · up to 25&nbsp;MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
    </Modal>
  )
}
