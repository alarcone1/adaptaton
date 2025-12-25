import React from 'react'
import { CheckCircle, Lock, AlertCircle, ArrowRight, Play, RefreshCw, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

interface Activity {
    id: string
    sequence_order: number | null
    prerequisite_activity_id: string | null
    resource?: {
        title: string
        base_description: string | null
        resource_url: string | null
    }
    custom_instructions: string | null
    due_date: string | null
}

interface ActivityStatus {
    status: 'locked' | 'pending' | 'submitted' | 'validated' | 'rejected'
    label: string
    color: string
    score?: number
    feedback?: string
}

interface TimelineProps {
    courseId: string
    activities: Activity[]
    // Function to get status of an activity
    getStatus: (activityId: string) => ActivityStatus
    // Function to check if specific activity is passed/validated (for prerequisite check)
    isActivityValidated: (activityId: string) => boolean
}

export const ActivityTimeline = ({ courseId, activities, getStatus, isActivityValidated }: TimelineProps) => {
    const navigate = useNavigate()

    const handleStart = (activityId: string) => {
        navigate(`/student/capture?courseId=${courseId}&activityId=${activityId}`)
    }

    const handleRetry = (activityId: string) => {
        navigate(`/student/capture?courseId=${courseId}&activityId=${activityId}&retry=true`)
    }

    const sortedActivities = [...activities].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0))

    return (
        <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
            {sortedActivities.map((activity, index) => {
                const { status, label, color, score, feedback } = getStatus(activity.id)

                // Check lock state based on prerequisites
                let isLocked = false
                if (activity.prerequisite_activity_id) {
                    const prereqValidated = isActivityValidated(activity.prerequisite_activity_id)
                    if (!prereqValidated) isLocked = true
                }

                const finalStatus = isLocked ? 'locked' : status

                return (
                    <div key={activity.id} className="relative group">
                        {/* Timeline Node */}
                        <div className={`absolute -left-12 mt-1 rounded-full p-2 border-4 transition-all z-10 ${finalStatus === 'validated' ? 'bg-green-500 border-green-100 text-white' :
                            finalStatus === 'submitted' ? 'bg-yellow-400 border-yellow-100 text-white' :
                                finalStatus === 'rejected' ? 'bg-red-500 border-red-100 text-white' :
                                    finalStatus === 'locked' ? 'bg-gray-200 border-gray-100 text-gray-400' :
                                        'bg-[#4B3179] border-[#4B3179]/20 text-white'
                            }`}>
                            {finalStatus === 'validated' ? <CheckCircle size={16} /> :
                                finalStatus === 'locked' ? <Lock size={16} /> :
                                    finalStatus === 'rejected' ? <AlertCircle size={16} /> :
                                        finalStatus === 'submitted' ? <Clock size={16} /> :
                                            <Play size={16} className="ml-0.5" />
                            }
                        </div>

                        {/* Content Card */}
                        <Card className={`transition-all border-l-4 ${finalStatus === 'validated' ? 'border-l-green-500 shadow-md bg-white' :
                            finalStatus === 'rejected' ? 'border-l-red-500 shadow-md bg-white' :
                                finalStatus === 'locked' ? 'border-l-gray-300 bg-gray-50 opacity-70 grayscale-[0.5]' :
                                    'border-l-[#4B3179] shadow-lg ring-1 ring-[#4B3179]/10'
                            }`}>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        {activity.resource?.title}
                                        {finalStatus === 'validated' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">+{score} pts</span>}
                                    </h4>

                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border ${finalStatus === 'validated' ? 'bg-green-50 text-green-700 border-green-200' :
                                        finalStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                            finalStatus === 'submitted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                finalStatus === 'locked' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                    'bg-[#4B3179]/10 text-[#4B3179] border-[#4B3179]/20 animate-pulse'
                                        }`}>
                                        {isLocked ? 'Bloqueado' : label}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{activity.custom_instructions || activity.resource?.base_description}</p>

                                <div className="flex items-center gap-3">
                                    {finalStatus === 'pending' && (
                                        <Button onClick={() => handleStart(activity.id)} className="w-full sm:w-auto shadow-[#4B3179]/20 shadow-lg group-hover:shadow-[#4B3179]/30 transition-all bg-[#4B3179] hover:bg-[#3b2663]">
                                            Iniciar Reto <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    )}

                                    {finalStatus === 'rejected' && (
                                        <div className="w-full">
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                                                <p className="text-xs font-bold text-red-800 uppercase mb-1">Feedback del Docente</p>
                                                <p className="text-red-600 text-sm italic">"{feedback}"</p>
                                            </div>

                                            <div className="flex items-center gap-4 relative">
                                                <div className="absolute -left-9 top-1/2 w-8 h-8 border-b-2 border-l-2 border-red-200 rounded-bl-full -z-10 bg-transparent"></div>
                                                <Button onClick={() => handleRetry(activity.id)} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <RefreshCw size={16} className="mr-2" /> Nuevo Intento
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {finalStatus === 'locked' && (
                                        <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                                            <Lock size={12} /> Completa la actividad anterior para desbloquear
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            })}
        </div>
    )
}
