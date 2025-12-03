"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, ChevronDown, ChevronUp, Check, ExternalLink, ShieldCheck } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LionLogo } from "@/components/lion-logo"
import { toast } from "@/components/ui/use-toast"

export default function TasksPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [referralLink, setReferralLink] = useState("")
  const [discordVerifying, setDiscordVerifying] = useState(false)
  const [identityVerifying, setIdentityVerifying] = useState(false)

  useEffect(() => {
    // Generate referral link - you can customize this logic
    const savedReferralLink = localStorage.getItem("referralLink")
    if (savedReferralLink) {
      setReferralLink(savedReferralLink)
    } else {
      const randomRef = Math.random().toString(36).substring(2, 8)
      const newLink = `https://bitbee.app/register?ref=${randomRef}`
      setReferralLink(newLink)
      localStorage.setItem("referralLink", newLink)
    }
  }, [])

  // Function to mark a task as completed
  const completeTask = (taskId: string, reward: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId])

      toast({
        title: "任務完成!",
        description: `您獲得了 ${reward}`,
      })
    }
  }

  // Simulate Discord OAuth callback
  const handleDiscordCallback = async () => {
    if (!completedTasks.includes("identity")) {
      toast({
        title: "請先完成首要任務",
        description: "您需要先完成身分驗證才能進行其他任務",
        variant: "destructive",
      })
      return
    }

    setDiscordVerifying(true)

    try {
      // In a real app, this would verify the Discord OAuth callback
      // For now, we'll simulate the verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      completeTask("discord", "+5 $HONEY")

      toast({
        title: "Discord 驗證成功!",
        description: "您已成功加入社區並完成驗證",
      })
    } catch (error) {
      toast({
        title: "驗證失敗",
        description: "請確保您已加入 Discord 社區",
      })
    } finally {
      setDiscordVerifying(false)
    }
  }

  const handleIdentityVerification = async () => {
    setIdentityVerifying(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      completeTask("identity", "+10 $HONEY")

      toast({
        title: "身分驗證成功!",
        description: "您已成功完成身分驗證",
      })
    } catch (error) {
      toast({
        title: "驗證失敗",
        description: "請確保您已完成所有驗證步驟",
      })
    } finally {
      setIdentityVerifying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-lion-face-light pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-lion-orange to-lion-red text-white p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2">
          <LionLogo size="sm" />
          <h1 className="text-2xl font-bold">任務中心</h1>
        </div>
      </header>

      {/* Tasks List */}
      <div className="flex-1 container max-w-md mx-auto px-4 pt-4 space-y-4 pb-4">
        {/* Task Cards */}
        <div className="space-y-4">
          <TaskCard
            id="identity"
            icon={<ShieldCheck className="h-5 w-5 text-white" />}
            title="首要任務: 完成身分驗證"
            description="完成 twin3 身分驗證以獲得獎勵"
            reward="+10 $HONEY"
            isCompleted={completedTasks.includes("identity")}
            onComplete={() => completeTask("identity", "+10 $HONEY")}
            onIdentityCallback={handleIdentityVerification}
            isVerifying={identityVerifying}
          />

          {/* Discord Task */}
          <TaskCard
            id="discord"
            icon={<MessageSquare className="h-5 w-5 text-white" />}
            title="加入 Discord 社區"
            description="加入 BitBee 官方 Discord 社區"
            reward="+5 $HONEY"
            isCompleted={completedTasks.includes("discord")}
            onComplete={() => completeTask("discord", "+5 $HONEY")}
            onDiscordCallback={handleDiscordCallback}
            isVerifying={discordVerifying}
            completedTasks={completedTasks}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="tasks" />
    </div>
  )
}

interface TaskCardProps {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  reward: string
  isCompleted?: boolean
  onComplete: () => void
  onDiscordCallback?: () => void
  onIdentityCallback?: () => void
  referralLink?: string
  isVerifying?: boolean
  completedTasks?: string[]
}

function TaskCard({
  id,
  icon,
  title,
  description,
  reward,
  isCompleted = false,
  onComplete,
  onDiscordCallback,
  onIdentityCallback,
  referralLink = "",
  isVerifying = false,
  completedTasks = [],
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Toggle expanded state
  const toggleExpand = () => {
    if (!isCompleted) {
      setIsExpanded(!isExpanded)
    }
  }

  // Handle Discord join
  const handleDiscordJoin = (e: React.MouseEvent) => {
    e.stopPropagation()

    console.log("[v0] Discord button clicked, completedTasks:", completedTasks)
    console.log("[v0] Identity completed?", completedTasks.includes("identity"))

    if (id === "discord" && !completedTasks.includes("identity")) {
      console.log("[v0] Showing prerequisite warning")

      // Show browser alert for immediate visibility
      alert("請先完成首要任務\n\n您需要先完成身分驗證才能進行其他任務")

      // Also show toast notification
      toast({
        title: "請先完成首要任務",
        description: "您需要先完成身分驗證才能進行其他任務",
        variant: "destructive",
      })
      return
    }

    window.open("https://discord.gg/zoo3", "_blank")

    if (id === "discord" && onDiscordCallback) {
      setTimeout(() => {
        onDiscordCallback()
      }, 2000)
    }
  }

  const handleIdentityVerify = (e: React.MouseEvent) => {
    e.stopPropagation()

    window.open("https://twin3.ai/verify", "_blank")

    if (id === "identity" && onIdentityCallback) {
      setTimeout(() => {
        onIdentityCallback()
      }, 2000)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden
        ${
          isCompleted
            ? "border-green-300 bg-green-50"
            : isExpanded
              ? "border-lion-orange shadow-lion"
              : "border-lion-face-dark shadow-sm hover:shadow-lion"
        }`}
    >
      <div className="flex items-start p-4 cursor-pointer" onClick={toggleExpand}>
        <div
          className={`p-3 rounded-full mr-3 shadow-sm ${
            isCompleted ? "bg-green-500" : "bg-gradient-to-br from-lion-orange to-lion-red"
          }`}
        >
          {isCompleted ? <Check className="h-5 w-5 text-white" /> : icon}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lion-accent">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-lion-face px-3 py-1 rounded-full text-lion-orange font-medium text-sm border border-lion-face-dark mb-1">
            {reward}
          </div>
          {!isCompleted && (
            <div className="text-gray-400">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && !isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3">
            {id === "identity" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">完成以下步驟以獲得獎勵：</p>

                <div className="space-y-2 bg-lion-face-light p-3 rounded-lg border border-lion-face">
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-700">點擊下方按鈕開始驗證</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">返回此頁面點擊「驗證完成」按鈕</p>
                  </div>
                </div>

                <Button
                  variant="teal"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleIdentityVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                  開始身分驗證
                </Button>

                <Button
                  variant="orange"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onIdentityCallback) {
                      onIdentityCallback()
                    }
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      驗證中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      驗證完成
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  完成驗證後即可獲得 +10 $HONEY 獎勵 <br />
                  <span className="text-gray-400">verify powered by twin3</span>
                </p>
              </div>
            )}

            {id === "discord" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">完成以下步驟以獲得獎勵：</p>

                <div className="space-y-2 bg-lion-face-light p-3 rounded-lg border border-lion-face">
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-700">點擊下方按鈕加入 Discord 社區</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">返回此頁面點擊「驗證加入」按鈕</p>
                  </div>
                </div>

                <Button
                  variant="teal"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDiscordJoin}
                >
                  <ExternalLink className="h-4 w-4" />
                  加入 Discord 社區
                </Button>

                <Button
                  variant="orange"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onDiscordCallback) {
                      onDiscordCallback()
                    }
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      驗證中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      驗證加入
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">完成驗證後即可獲得 +5 $HONEY 獎勵</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-green-100 pt-3">
            <p className="text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              任務已完成！
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
