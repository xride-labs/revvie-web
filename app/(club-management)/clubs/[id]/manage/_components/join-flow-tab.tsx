'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  useGetClubJoinFlowQuery,
  useUpdateClubJoinFlowMutation,
} from '@/features/clubs/api'
import type { ClubJoinQuestion } from '@/features/clubs/schemas'
import {
  Plus,
  Trash2,
  HelpCircle,
  Lock,
  Globe,
  FileQuestion,
  Eye,
  GripVertical,
  ShieldCheck,
  Save,
} from 'lucide-react'

interface JoinFlowTabProps {
  clubId: string
}

export function JoinFlowTab({ clubId }: JoinFlowTabProps) {
  const { data, isLoading } = useGetClubJoinFlowQuery(clubId)
  const [updateJoinFlow, { isLoading: isSaving }] = useUpdateClubJoinFlowMutation()
  const { success: successToast, error: errorToast } = useToast()

  const [policy, setPolicy] = useState<'OPEN' | 'APPLICATION' | 'INVITE_ONLY'>('OPEN')
  const [requiresLicense, setRequiresLicense] = useState(false)
  const [questions, setQuestions] = useState<ClubJoinQuestion[]>([])

  // Modal for new/edit question
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [promptText, setPromptText] = useState('')
  const [answerType, setAnswerType] = useState<'text' | 'choice'>('text')
  const [isRequired, setIsRequired] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [currentOptionInput, setCurrentOptionInput] = useState('')

  useEffect(() => {
    if (data?.joinFlow) {
      setPolicy(data.joinFlow.joinPolicy)
      setRequiresLicense(data.joinFlow.requiresLicense)
      setQuestions(data.joinFlow.joinQuestions || [])
    }
  }, [data])

  const handleOpenAddDialog = () => {
    setEditingQuestionId(null)
    setPromptText('')
    setAnswerType('text')
    setIsRequired(true)
    setOptions([])
    setCurrentOptionInput('')
    setIsQuestionDialogOpen(true)
  }

  const handleOpenEditDialog = (q: ClubJoinQuestion) => {
    setEditingQuestionId(q.id)
    setPromptText(q.question)
    setAnswerType(q.type)
    setIsRequired(q.required)
    setOptions(q.options || [])
    setCurrentOptionInput('')
    setIsQuestionDialogOpen(true)
  }

  const handleAddOption = () => {
    const trimmed = currentOptionInput.trim()
    if (!trimmed || options.includes(trimmed)) return
    setOptions([...options, trimmed])
    setCurrentOptionInput('')
  }

  const handleRemoveOption = (optToRemove: string) => {
    setOptions(options.filter((opt) => opt !== optToRemove))
  }

  const handleSaveQuestion = () => {
    if (!promptText.trim()) {
      errorToast('Question prompt cannot be empty')
      return
    }

    if (answerType === 'choice' && options.length < 2) {
      errorToast('Multiple-choice questions need at least 2 options')
      return
    }

    if (editingQuestionId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                question: promptText.trim(),
                type: answerType,
                required: isRequired,
                options: answerType === 'choice' ? options : undefined,
              }
            : q,
        ),
      )
    } else {
      const newQuestion: ClubJoinQuestion = {
        id: `q_${Date.now()}`,
        question: promptText.trim(),
        type: answerType,
        required: isRequired,
        options: answerType === 'choice' ? options : undefined,
      }
      setQuestions((prev) => [...prev, newQuestion])
    }

    setIsQuestionDialogOpen(false)
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleSaveAll = async () => {
    try {
      await updateJoinFlow({
        clubId,
        data: {
          joinPolicy: policy,
          requiresLicense,
          joinQuestions: questions,
        },
      }).unwrap()
      successToast('Join policy and questions updated successfully')
    } catch (err) {
      errorToast('Failed to save join policy', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Policy & License Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Join Policy</CardTitle>
            </div>
            <CardDescription>
              Control who can join your club and whether membership requires approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admission Rule</Label>
              <Select
                value={policy}
                onValueChange={(val: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY') =>
                  setPolicy(val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select admission policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-foreground">Open Admission</p>
                        <p className="text-xs text-muted-foreground">
                          Any rider joins instantly without approval
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="APPLICATION">
                    <div className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-amber-400" />
                      <div>
                        <p className="font-semibold text-foreground">Application Required</p>
                        <p className="text-xs text-muted-foreground">
                          Riders must submit answers; admins review and approve
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="INVITE_ONLY">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Invite Only</p>
                        <p className="text-xs text-muted-foreground">
                          Only members with direct invitations can enter
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Verify Motorcycle License</Label>
                <p className="text-xs text-muted-foreground">
                  Require applicant to have a verified driving license on file
                </p>
              </div>
              <Switch
                checked={requiresLicense}
                onCheckedChange={setRequiresLicense}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 pt-4">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full gap-2 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>

        {/* Live Applicant Preview */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Applicant Preview</CardTitle>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                LIVE PREVIEW
              </Badge>
            </div>
            <CardDescription>
              How prospective members will experience joining your club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-background/80 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="font-semibold text-sm">Join Application</span>
                <Badge
                  variant={policy === 'OPEN' ? 'secondary' : 'default'}
                  className={
                    policy === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : policy === 'APPLICATION'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                  }
                >
                  {policy}
                </Badge>
              </div>

              {policy === 'OPEN' && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Riders can tap &quot;Join Club&quot; and become active members instantly.
                </div>
              )}

              {policy === 'INVITE_ONLY' && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Applications are closed. Only direct invitations from managers are accepted.
                </div>
              )}

              {policy === 'APPLICATION' && (
                <div className="space-y-4">
                  {requiresLicense && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Valid two-wheeler driving license is strictly required.</span>
                    </div>
                  )}

                  {questions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No questions configured. Applicants will simply submit a join request.
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} className="space-y-1.5 text-xs">
                        <label className="font-medium text-foreground">
                          {idx + 1}. {q.question}{' '}
                          {q.required && <span className="text-primary">*</span>}
                        </label>
                        {q.type === 'text' ? (
                          <Input
                            placeholder="Applicant types their answer here..."
                            disabled
                            className="h-8 text-xs bg-muted/30"
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options?.map((opt) => (
                              <div
                                key={opt}
                                className="flex items-center gap-2 rounded border border-border/40 p-2 text-muted-foreground"
                              >
                                <div className="h-3 w-3 rounded-full border border-border/80" />
                                <span className="truncate">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Custom Questionnaire Editor */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                <CardTitle>Application Questionnaire</CardTitle>
              </div>
              <CardDescription>
                Ask applicants about their riding history, bike model, or club etiquette
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenAddDialog}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center">
              <HelpCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No questions added yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                Add questions to filter and screen riders who want to join your club.
              </p>
              <Button onClick={handleOpenAddDialog} variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/40 bg-background/50 p-4 transition-colors hover:border-border/80"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground">
                          Q{idx + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {q.type}
                        </Badge>
                        {q.required ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                      {q.type === 'choice' && q.options && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.options.map((opt) => (
                            <Badge
                              key={opt}
                              variant="outline"
                              className="text-[11px] bg-muted/40 font-normal"
                            >
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(q)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {questions.length > 0 && (
          <CardFooter className="border-t border-border/40 pt-4 flex justify-end">
            <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Changes...' : 'Save All Questions'}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Question Form Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionId ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              Formulate a prompt that prospective members must answer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="question-prompt">Question Prompt</Label>
              <Input
                id="question-prompt"
                placeholder="e.g., Which motorcycle do you currently ride?"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Answer Type</Label>
                <Select
                  value={answerType}
                  onValueChange={(val: 'text' | 'choice') => setAnswerType(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Response</SelectItem>
                    <SelectItem value="choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end pb-1">
                <div className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
                  <Label className="text-xs">Required</Label>
                  <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                </div>
              </div>
            </div>

            {answerType === 'choice' && (
              <div className="space-y-3 pt-2">
                <Label>Answer Options</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Royal Enfield Hunter 350"
                    value={currentOptionInput}
                    onChange={(e) => setCurrentOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddOption()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddOption} size="sm">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {options.map((opt) => (
                    <Badge
                      key={opt}
                      variant="secondary"
                      className="gap-1.5 py-1 px-2.5 text-xs"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {options.length < 2 && (
                  <p className="text-[11px] text-amber-400">
                    Add at least 2 options for multiple-choice questions
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuestionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestionId ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
