import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import type { ClubJoinQuestion } from '@/entities/club/model'
import type { ClubJoinAnswer } from '@/features/clubs/schemas'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface JoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clubName: string
  isPublic: boolean
  joinPolicy?: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY'
  requiresLicense?: boolean
  joinQuestions?: ClubJoinQuestion[] | null
  isSubmitting?: boolean
  onConfirm: (payload?: {
    message?: string
    answers?: ClubJoinAnswer[]
  }) => Promise<void> | void
}

export function JoinDialog({
  open,
  onOpenChange,
  clubName,
  isPublic,
  joinPolicy = 'OPEN',
  requiresLicense = false,
  joinQuestions = [],
  isSubmitting = false,
  onConfirm,
}: JoinDialogProps) {
  const [message, setMessage] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const questions = joinQuestions ?? []
  const isApplication = joinPolicy === 'APPLICATION' || (!isPublic && joinPolicy !== 'INVITE_ONLY')
  const isInviteOnly = joinPolicy === 'INVITE_ONLY'

  useEffect(() => {
    if (open) {
      setMessage('')
      setAnswers({})
      setErrors({})
    }
  }, [open])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required questions
    const newErrors: Record<string, string> = {}
    for (const q of questions) {
      if (q.required && (!answers[q.id] || !answers[q.id].trim())) {
        newErrors[q.id] = 'This question is required by the club.'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedAnswers: ClubJoinAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id]?.trim() || '',
    }))

    await onConfirm({
      message: message.trim() || undefined,
      answers: formattedAnswers.length > 0 ? formattedAnswers : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#1c1c1e] border-[#3a3a3c] text-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-lg font-bold text-white">
                Join {clubName}
              </DialogTitle>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono uppercase ${
                  isInviteOnly
                    ? 'border-neutral-500 text-neutral-400'
                    : isApplication
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {isInviteOnly ? 'Invite Only' : isApplication ? 'Application' : 'Instant Join'}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-neutral-400">
              {isInviteOnly
                ? 'This club is private and accepts new members by invitation only.'
                : isApplication
                  ? 'The club administrators require you to fill out an application form before joining.'
                  : 'You will be added to the club immediately upon confirmation.'}
            </DialogDescription>
          </DialogHeader>

          {isInviteOnly ? (
            <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-300 leading-relaxed">
                You cannot apply to this club directly. Please request an invitation from an active member or club officer.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {requiresLicense && (
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/10 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      Driving License Required
                    </p>
                    <p className="text-[11px] text-primary/80 mt-0.5">
                      This club requires all riders to hold a valid motorcycle driver&apos;s license for group rides.
                    </p>
                  </div>
                </div>
              )}

              {/* Questionnaire fields */}
              {questions.length > 0 && (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#3a3a3c]">
                    <CheckCircle2 className="w-4 h-4 text-[#ff1d2d]" />
                    <span className="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-300">
                      Club Questionnaire
                    </span>
                  </div>

                  {questions.map((q, idx) => (
                    <div key={q.id} className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-200 flex items-center justify-between">
                        <span>
                          {idx + 1}. {q.question}
                          {q.required && <span className="text-[#ff1d2d] ml-1">*</span>}
                        </span>
                      </Label>

                      {q.type === 'CHOICE' && q.options && q.options.length > 0 ? (
                        <Select
                          value={answers[q.id] || ''}
                          onValueChange={(val) => handleAnswerChange(q.id, val)}
                        >
                          <SelectTrigger className="bg-[#0d0d0f] border-[#3a3a3c] text-xs h-9">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1c1c1e] border-[#3a3a3c] text-white">
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt} className="text-xs">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Your answer..."
                          className="bg-[#0d0d0f] border-[#3a3a3c] text-xs h-9 focus-visible:ring-[#ff1d2d]"
                        />
                      )}

                      {errors[q.id] && (
                        <p className="text-[11px] text-red-500 font-mono">
                          {errors[q.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message to admins */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="join-message" className="text-xs font-medium text-neutral-300">
                  {isApplication ? 'Note to Club Admins (Optional)' : 'Message (Optional)'}
                </Label>
                <Textarea
                  id="join-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, mention what bike you ride..."
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-xs h-20 resize-none focus-visible:ring-[#ff1d2d]"
                  maxLength={500}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#3a3a3c]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-[#3a3a3c] bg-[#1c1c1e] text-neutral-300 hover:text-white text-xs"
            >
              Cancel
            </Button>
            {!isInviteOnly && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#ff1d2d] hover:bg-[#b3151f] text-white text-xs gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : isApplication ? (
                  'Submit Application'
                ) : (
                  'Join Now'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

