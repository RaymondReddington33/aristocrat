"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { checkIOSRepetitions, checkAndroidRepetitions, type RepetitionCheckResult } from "@/lib/keyword-repetition-checker"
import type { AppData } from "@/lib/types"

interface KeywordRepetitionAlertProps {
  appData: Partial<AppData>
  platform: "ios" | "android"
}

export function KeywordRepetitionAlert({ appData, platform }: KeywordRepetitionAlertProps) {
  const result: RepetitionCheckResult = platform === "ios"
    ? checkIOSRepetitions({
        ios_app_name: appData.ios_app_name,
        ios_subtitle: appData.ios_subtitle,
        ios_keywords: appData.ios_keywords
      })
    : checkAndroidRepetitions({
        android_app_name: appData.android_app_name,
        android_short_description: appData.android_short_description,
        android_full_description: appData.android_full_description
      })

  if (!result.hasIssues) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 font-semibold">ASO 2026: No repetitions detected</AlertTitle>
        <AlertDescription className="text-green-700">
          ✅ No keyword repetitions detected between indexable fields. Your strategy complies with ASO 2026 best practices.
        </AlertDescription>
      </Alert>
    )
  }

  const errorIssues = result.issues.filter(i => i.severity === "error")
  const warningIssues = result.issues.filter(i => i.severity === "warning")
  const hasErrors = errorIssues.length > 0

  return (
    <Alert className={hasErrors ? "border-red-500 bg-red-50" : "border-amber-500 bg-amber-50"}>
      {hasErrors ? (
        <AlertCircle className="h-4 w-4 text-red-600" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-600" />
      )}
      <AlertTitle className={hasErrors ? "text-red-800 font-semibold" : "text-amber-800 font-semibold"}>
        ASO 2026: {result.issues.length} repetition issue(s) detected
      </AlertTitle>
      <AlertDescription className={hasErrors ? "text-red-700" : "text-amber-700"}>
        <div className="space-y-3 mt-2">
          {/* Error Issues */}
          {errorIssues.length > 0 && (
            <div>
              <div className="font-semibold mb-2">Critical errors ({errorIssues.length}):</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                {errorIssues.map((issue, index) => (
                  <li key={index}>
                    <span className="font-medium">{issue.message}</span>
                    {issue.recommendation && (
                      <div className="text-sm mt-0.5 ml-4">{issue.recommendation}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Warning Issues */}
          {warningIssues.length > 0 && (
            <div>
              <div className="font-semibold mb-2">Warnings ({warningIssues.length}):</div>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                {warningIssues.map((issue, index) => (
                  <li key={index}>
                    <span className="font-medium">{issue.message}</span>
                    {issue.recommendation && (
                      <div className="text-sm mt-0.5 ml-4">{issue.recommendation}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Score */}
          <div className="pt-2 border-t border-current/20">
            <div className="text-sm">
              <span className="font-semibold">ASO Score:</span> {result.score}/100
              {result.score < 70 && (
                <span className="ml-2">⚠️ Improvement recommended</span>
              )}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
