import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { useToast } from '../../components/ui/toast'
import { getErrorMessage } from '../../lib/api'
import type { QAPair } from '../../lib/types'
import { useCreateQAPair, useUpdateQAPair } from './hooks'

interface QAFormModalProps {
  open: boolean
  /** Pair being edited, or null when creating. */
  pair: QAPair | null
  onClose: () => void
}

export function QAFormModal({ open, pair, onClose }: QAFormModalProps) {
  const isEdit = pair !== null
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const toast = useToast()
  const createMutation = useCreateQAPair()
  const updateMutation = useUpdateQAPair()
  const saving = createMutation.isPending || updateMutation.isPending

  // Seed the fields each time the modal opens, adjusting state during render
  // (React's recommended alternative to a prop-sync effect).
  const [wasOpen, setWasOpen] = useState(false)
  if (open && !wasOpen) {
    setWasOpen(true)
    setQuestion(pair?.question ?? '')
    setAnswer(pair?.answer ?? '')
  } else if (!open && wasOpen) {
    setWasOpen(false)
  }

  async function handleSave() {
    const q = question.trim()
    const a = answer.trim()
    if (!q || !a) {
      toast.error('Both a question and an answer are required')
      return
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: pair.id, input: { question: q, answer: a } })
        toast.success('Q&A pair updated')
      } else {
        await createMutation.mutateAsync({ question: q, answer: a })
        toast.success('Q&A pair created')
      }
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save Q&A pair'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Knowledge Entry' : 'New Knowledge Entry'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Pair'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
          Trigger Question
        </label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How do I reset my password?"
          maxLength={1000}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
          Curated Answer
        </label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write the exact answer the assistant should give…"
          maxLength={10000}
          rows={6}
        />
      </div>

      <div className="flex items-center gap-3 bg-surface border border-outline-variant/50 rounded-lg p-3">
        <Icon name="info" size={18} className="text-on-surface-variant shrink-0" />
        <p className="text-[13px] text-on-surface-variant">
          Saving re-embeds this pair so the assistant picks up the change immediately.
        </p>
      </div>
    </Modal>
  )
}
