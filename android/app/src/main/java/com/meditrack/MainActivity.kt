package com.meditrack

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MediTrack"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // ── Show over lock screen + wake screen ───────────────
    // Already correct. Needed so fullScreenAction in notifee
    // can physically display over the Android lock screen.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON   or
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
      )
    }

    // ── ADDED: Dismiss keyguard (PIN / pattern lock screen) ──
    // Problem it fixes:
    //   On devices with PIN/pattern/fingerprint lock,
    //   AlarmAlertModal renders BEHIND the lock screen —
    //   the alarm is ringing but the user sees nothing.
    // This forces the lock screen out of the way so the
    // mandatory alarm dialog is always visible.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val km = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      km.requestDismissKeyguard(this, null)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
    }
  }

  // ── ADDED: Handle alarm when app is already running ──────
  // Problem it fixes:
  //   When the app is already open and a second alarm fires,
  //   Android calls onNewIntent (NOT onCreate). Without this
  //   override, notifee never sees the new intent →
  //   AlarmAlertModal never appears for alarms 2, 3, 4...
  //   Only the very first alarm in a session would work.
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent) // update so notifee.getInitialNotification() reads the new alarm
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}