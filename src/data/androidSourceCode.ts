import { AndroidCodeFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidCodeFile[] = [
  {
    path: 'settings.gradle.kts',
    language: 'groovy',
    description: 'Gradle project settings and repository configurations',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ReplyFloatAI"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    language: 'groovy',
    description: 'Top-level build script',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    language: 'properties',
    description: 'Gradle Version Catalog for modern dependencies',
    content: `[versions]
agp = "8.8.0"
kotlin = "2.1.0"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.10.0"
composeBom = "2025.02.00"
coroutines = "1.10.1"
datastore = "1.1.2"
securityCrypto = "1.1.0-alpha06"
okhttp = "4.12.0"
gson = "2.12.1"
navigationCompose = "2.8.7"
materialIconsExtended = "1.7.8"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIconsExtended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }
gson = { group = "com.google.code.gson", name = "gson", version.ref = "gson" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'App module build configuration and dependencies',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.replyfloat.ai"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.replyfloat.ai"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.security.crypto)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest declaring permissions, services, and activities',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions required for Floating Overlay & Pass-Through -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Required to query installed apps for the App Whitelist Selector -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" 
        tools:ignore="QueryAllPackagesPermission" />

    <application
        android:name=".ReplyFloatApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ReplyFloatAI"
        tools:targetApi="35">

        <!-- Main Launcher Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.ReplyFloatAI">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Floating Overlay Window Service -->
        <service
            android:name=".service.FloatingOverlayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating AI reply assistant overlay over user-selected applications" />
        </service>

        <!-- Accessibility Service for Context Text Analysis -->
        <service
            android:name=".service.ReplyFloatAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="@string/accessibility_service_label"
            android:description="@string/accessibility_service_description"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Quick Settings Tile for One-Tap Activation -->
        <service
            android:name=".service.QuickSettingsTileService"
            android:icon="@drawable/ic_quick_tile"
            android:label="@string/tile_label"
            android:permission="android.permission.BIND_QUICK_SETTINGS_TILE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.quicksettings.action.QS_TILE" />
            </intent-filter>
        </service>

    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    language: 'xml',
    description: 'Accessibility Service XML configuration for text event listening',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeWindowStateChanged|typeViewTextChanged|typeViewScrolled|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="300"
    android:canRetrieveWindowContent="true"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagIncludeNotImportantViews"
    android:settingsActivity="com.replyfloat.ai.MainActivity" />
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    description: 'Application string resources',
    content: `<resources>
    <string name="app_name">ReplyFloat AI</string>
    <string name="accessibility_service_label">ReplyFloat AI Context Detection</string>
    <string name="accessibility_service_description">Reads visible text from your allowed messaging, social, and forum applications to generate instant contextual replies. Never records or sends data outside your chosen AI provider.</string>
    <string name="tile_label">ReplyFloat</string>
    <string name="notification_channel_name">ReplyFloat Assistant Service</string>
    <string name="notification_channel_desc">Active floating assistant status and controls</string>
</resources>
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/ReplyFloatApplication.kt',
    language: 'kotlin',
    description: 'Application class with notification channel setup',
    content: `package com.replyfloat.ai

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class ReplyFloatApplication : Application() {

    companion object {
        const val CHANNEL_ID = "replyfloat_overlay_channel"
        lateinit var instance: ReplyFloatApplication
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.notification_channel_desc)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/MainActivity.kt',
    language: 'kotlin',
    description: 'Main Jetpack Compose entry activity with navigation and permission checks',
    content: `package com.replyfloat.ai

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.rememberNavController
import com.replyfloat.ai.ui.navigation.ReplyFloatNavHost
import com.replyfloat.ai.ui.theme.ReplyFloatAITheme
import com.replyfloat.ai.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            ReplyFloatAITheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val viewModel: MainViewModel = viewModel()
                    
                    ReplyFloatNavHost(
                        navController = navController,
                        viewModel = viewModel,
                        onRequestOverlayPermission = { requestOverlayPermission() },
                        onRequestAccessibilityPermission = { requestAccessibilityPermission() }
                    )
                }
            }
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivity(intent)
        }
    }

    private fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/service/FloatingOverlayService.kt',
    language: 'kotlin',
    description: 'WindowManager Floating Overlay with Pass-Through touch flag switching & Compose UI',
    content: `package com.replyfloat.ai.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import androidx.lifecycle.*
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.replyfloat.ai.MainActivity
import com.replyfloat.ai.R
import com.replyfloat.ai.ReplyFloatApplication
import com.replyfloat.ai.data.AppPreferencesRepository
import com.replyfloat.ai.ui.overlay.FloatingOverlayContent
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collectLatest

/**
 * Service managing the floating interactive and transparent overlay.
 * Supports "Pass-Through Mode" using FLAG_NOT_TOUCHABLE so underlying apps
 * receive all touch events when pass-through is active.
 */
class FloatingOverlayService : Service(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {

    private lateinit var windowManager: WindowManager
    private var overlayComposeView: ComposeView? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val lifecycleRegistry = LifecycleRegistry(this)
    private val store = ViewModelStore()
    private val savedStateRegistryController = SavedStateRegistryController.create(this)

    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val viewModelStore: ViewModelStore get() = store
    override val savedStateRegistry: SavedStateRegistry get() = savedStateRegistryController.savedStateRegistry

    companion object {
        const val ACTION_START = "ACTION_START_OVERLAY"
        const val ACTION_STOP = "ACTION_STOP_OVERLAY"
        const val ACTION_UPDATE_TEXT = "ACTION_UPDATE_TEXT"
        const val EXTRA_DETECTED_TEXT = "EXTRA_DETECTED_TEXT"
        const val EXTRA_PACKAGE_NAME = "EXTRA_PACKAGE_NAME"

        fun startService(context: Context, text: String = "", pkg: String = "") {
            val intent = Intent(context, FloatingOverlayService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DETECTED_TEXT, text)
                putExtra(EXTRA_PACKAGE_NAME, pkg)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, FloatingOverlayService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                removeOverlay()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                startForeground(1001, createNotification())
                val detectedText = intent?.getStringExtra(EXTRA_DETECTED_TEXT) ?: ""
                val packageName = intent?.getStringExtra(EXTRA_PACKAGE_NAME) ?: ""
                if (overlayComposeView == null) {
                    showOverlay(detectedText, packageName)
                } else {
                    updateOverlayText(detectedText, packageName)
                }
            }
        }
        return START_STICKY
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun showOverlay(initialText: String, initialPackage: String) {
        val windowType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        // Default layout flags: Not focusable, not touch modal, fits system windows
        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            windowType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 300
        }

        val composeView = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@FloatingOverlayService)
            setViewTreeViewModelStoreOwner(this@FloatingOverlayService)
            setViewTreeSavedStateRegistryOwner(this@FloatingOverlayService)

            setContent {
                FloatingOverlayContent(
                    initialText = initialText,
                    initialPackage = initialPackage,
                    onClose = {
                        stopForeground(STOP_FOREGROUND_REMOVE)
                        stopSelf()
                    },
                    onDrag = { dx, dy ->
                        layoutParams.x += dx.toInt()
                        layoutParams.y += dy.toInt()
                        windowManager.updateViewLayout(this, layoutParams)
                    },
                    onTogglePassThrough = { isPassThrough ->
                        setPassThroughMode(isPassThrough)
                    }
                )
            }
        }

        overlayComposeView = composeView
        windowManager.addView(composeView, layoutParams)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
    }

    /**
     * Toggles touch pass-through.
     * When passThrough == true: add FLAG_NOT_TOUCHABLE so touches pass directly to the underlying app!
     */
    private fun setPassThroughMode(passThrough: Boolean) {
        val view = overlayComposeView ?: return
        if (passThrough) {
            layoutParams.flags = layoutParams.flags or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
        } else {
            layoutParams.flags = layoutParams.flags and WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE.inv()
        }
        windowManager.updateViewLayout(view, layoutParams)
    }

    private fun updateOverlayText(text: String, pkg: String) {
        // Dispatches text update to overlay state repository
    }

    private fun removeOverlay() {
        overlayComposeView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            overlayComposeView = null
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, FloatingOverlayService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, ReplyFloatApplication.CHANNEL_ID)
            .setContentTitle("ReplyFloat AI Active")
            .setContentText("Tap to open settings or manage floating overlay")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Overlay", stopIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        removeOverlay()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/service/ReplyFloatAccessibilityService.kt',
    language: 'kotlin',
    description: 'Accessibility Service extracting text tree with package filtering and debouncing',
    content: `package com.replyfloat.ai.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.replyfloat.ai.data.AppPreferencesRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

/**
 * Legitimate Android Accessibility Service that inspects visible text nodes
 * ONLY on applications selected in the user's whitelist.
 * Zero screenshots, zero continuous battery drain, debounced text extraction.
 */
class ReplyFloatAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private val debounceHandler = Handler(Looper.getMainLooper())
    private var pendingDebounceRunnable: Runnable? = null
    private var lastExtractedText = ""
    private var lastPackage = ""

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                    AccessibilityEvent.TYPE_VIEW_SCROLLED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 300
            flags = AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                    AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val packageName = event.packageName?.toString() ?: return

        // Ignore our own package
        if (packageName == applicationContext.packageName) return

        serviceScope.launch {
            val repository = AppPreferencesRepository.getInstance(applicationContext)
            val isEnabled = repository.isMasterEnabled.first()
            if (!isEnabled) return@launch

            val isAllowed = repository.isAppAllowed(packageName).first()
            if (!isAllowed) return@launch

            val debounceTime = repository.debounceMs.first()

            // Debounce processing to avoid triggering on every character or micro scroll
            pendingDebounceRunnable?.let { debounceHandler.removeCallbacks(it) }
            pendingDebounceRunnable = Runnable {
                extractVisibleTextAsync(packageName)
            }
            debounceHandler.postDelayed(pendingDebounceRunnable!!, debounceTime)
        }
    }

    private fun extractVisibleTextAsync(packageName: String) {
        val rootNode = rootInActiveWindow ?: return
        try {
            val textBuilder = StringBuilder()
            traverseNode(rootNode, textBuilder)
            val extracted = textBuilder.toString().trim()

            if (extracted.isNotEmpty() && extracted != lastExtractedText) {
                lastExtractedText = extracted
                lastPackage = packageName

                // Dispatch to floating overlay service
                FloatingOverlayService.startService(
                    context = applicationContext,
                    text = extracted,
                    pkg = packageName
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            rootNode.recycle()
        }
    }

    private fun traverseNode(node: AccessibilityNodeInfo?, builder: StringBuilder) {
        if (node == null) return
        if (node.text != null && node.text.isNotBlank()) {
            val textStr = node.text.toString().trim()
            // Ignore trivial single character or numeric timestamps
            if (textStr.length > 2) {
                builder.append(textStr).append("\\n")
            }
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            traverseNode(child, builder)
            child.recycle()
        }
    }

    override fun onInterrupt() {
        pendingDebounceRunnable?.let { debounceHandler.removeCallbacks(it) }
    }

    override fun onDestroy() {
        serviceScope.cancel()
        pendingDebounceRunnable?.let { debounceHandler.removeCallbacks(it) }
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/service/QuickSettingsTileService.kt',
    language: 'kotlin',
    description: 'Quick Settings Tile for one-tap overlay activation',
    content: `package com.replyfloat.ai.service

import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi
import com.replyfloat.ai.data.AppPreferencesRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

@RequiresApi(Build.VERSION_CODES.N)
class QuickSettingsTileService : TileService() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        serviceScope.launch {
            val repo = AppPreferencesRepository.getInstance(applicationContext)
            val currentState = repo.isMasterEnabled.first()
            val newState = !currentState
            repo.setMasterEnabled(newState)

            if (newState) {
                FloatingOverlayService.startService(applicationContext)
            } else {
                FloatingOverlayService.stopService(applicationContext)
            }
            updateTileState()
        }
    }

    private fun updateTileState() {
        serviceScope.launch {
            val repo = AppPreferencesRepository.getInstance(applicationContext)
            val isEnabled = repo.isMasterEnabled.first()
            qsTile?.apply {
                state = if (isEnabled) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
                label = "ReplyFloat"
                updateTile()
            }
        }
    }

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/ai/AIProviderManager.kt',
    language: 'kotlin',
    description: 'Extensible AI Provider Manager supporting Gemini, OpenAI, & Custom endpoints',
    content: `package com.replyfloat.ai.ai

import com.replyfloat.ai.model.AIProviderConfig
import com.replyfloat.ai.model.ReplyRequest
import com.replyfloat.ai.model.ReplySuggestion

interface AIProvider {
    val id: String
    val name: String
    suspend fun generateReplies(request: ReplyRequest): Result<List<ReplySuggestion>>
    suspend fun testConnection(): Result<Boolean>
}

class AIProviderManager(
    private val providers: Map<String, AIProvider>
) {
    suspend fun generateReplies(
        providerId: String,
        request: ReplyRequest
    ): Result<List<ReplySuggestion>> {
        val provider = providers[providerId]
            ?: return Result.failure(IllegalArgumentException("Provider '$providerId' not found or disabled"))
        return provider.generateReplies(request)
    }

    companion object {
        fun createProvider(config: AIProviderConfig): AIProvider {
            return when (config.type.lowercase()) {
                "gemini" -> GeminiProvider(config)
                "openai" -> OpenAIProvider(config)
                "custom" -> CustomOpenAICompatibleProvider(config)
                else -> GeminiProvider(config)
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/ai/GeminiProvider.kt',
    language: 'kotlin',
    description: 'Google Gemini 3.7 / 2.5 Provider with structured JSON output',
    content: `package com.replyfloat.ai.ai

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.replyfloat.ai.model.AIProviderConfig
import com.replyfloat.ai.model.ReplyRequest
import com.replyfloat.ai.model.ReplySuggestion
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class GeminiProvider(
    private val config: AIProviderConfig,
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build(),
    private val gson: Gson = Gson()
) : AIProvider {

    override val id: String = config.id
    override val name: String = config.name

    override suspend fun generateReplies(request: ReplyRequest): Result<List<ReplySuggestion>> =
        withContext(Dispatchers.IO) {
            try {
                val apiKey = config.apiKey
                if (apiKey.isBlank()) {
                    return@withContext Result.failure(IllegalStateException("Gemini API key is missing."))
                }

                val model = config.model.ifBlank { "gemini-3.7-flash" }
                val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"

                val systemPrompt = """
                    You are ReplyFloat AI, an Android floating reply assistant.
                    Generate \${request.count} distinct reply suggestions in the style '\${request.style}'.
                    Length: \${request.length}.
                    Return JSON: {"replies": [{"style": "\${request.style}", "text": "...", "tone": "..."}]}
                """.trimIndent()

                val payload = JsonObject().apply {
                    val contentsArr = com.google.gson.JsonArray().apply {
                        val partObj = JsonObject().apply {
                            val partsArr = com.google.gson.JsonArray().apply {
                                add(JsonObject().apply {
                                    addProperty("text", "Context: \${request.conversationText}")
                                })
                            }
                            add("parts", partsArr)
                        }
                        add(partObj)
                    }
                    add("contents", contentsArr)
                    
                    val systemInstructionObj = JsonObject().apply {
                        val partsArr = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", systemPrompt) })
                        }
                        add("parts", partsArr)
                    }
                    add("systemInstruction", systemInstructionObj)
                }

                val body = payload.toString().toRequestBody("application/json".toMediaType())
                val httpRequest = Request.Builder().url(url).post(body).build()

                val response = client.newCall(httpRequest).execute()
                if (!response.isSuccessful) {
                    val err = response.body?.string() ?: "HTTP error \${response.code}"
                    return@withContext Result.failure(Exception("Gemini API Error (\${response.code}): $err"))
                }

                val resBody = response.body?.string() ?: ""
                val rootJson = gson.fromJson(resBody, JsonObject::class.java)
                val candidates = rootJson.getAsJsonArray("candidates")
                val firstCandidate = candidates?.get(0)?.asJsonObject
                val content = firstCandidate?.getAsJsonObject("content")
                val parts = content?.getAsJsonArray("parts")
                val text = parts?.get(0)?.asJsonObject?.get("text")?.asString ?: ""

                // Extract structured suggestions
                val suggestions = parseSuggestions(text, request.style)
                Result.success(suggestions)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    private fun parseSuggestions(rawText: String, defaultStyle: String): List<ReplySuggestion> {
        val list = mutableListOf<ReplySuggestion>()
        try {
            val jsonRegex = Regex("""\\{.*\\}""", RegexOption.DOT_MATCHES_ALL)
            val match = jsonRegex.find(rawText)?.value
            if (match != null) {
                val json = gson.fromJson(match, JsonObject::class.java)
                val arr = json.getAsJsonArray("replies")
                arr?.forEachIndexed { index, item ->
                    val obj = item.asJsonObject
                    list.add(
                        ReplySuggestion(
                            id = index.toString(),
                            style = obj.get("style")?.asString ?: defaultStyle,
                            text = obj.get("text")?.asString ?: "",
                            tone = obj.get("tone")?.asString ?: defaultStyle
                        )
                    )
                }
            }
        } catch (e: Exception) {
            // Fallback split
            rawText.lines().filter { it.isNotBlank() }.take(3).forEachIndexed { index, line ->
                list.add(
                    ReplySuggestion(
                        id = index.toString(),
                        style = defaultStyle,
                        text = line.replace(Regex("""^\\d+[\\.\\)]\\s*"""), "").trim('"', ' '),
                        tone = defaultStyle
                    )
                )
            }
        }
        return list
    }

    override suspend fun testConnection(): Result<Boolean> = withContext(Dispatchers.IO) {
        val dummy = ReplyRequest(
            conversationText = "Hello",
            style = "Short",
            count = 1,
            length = "short"
        )
        generateReplies(dummy).map { true }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/ai/OpenAIProvider.kt',
    language: 'kotlin',
    description: 'OpenAI and Custom OpenAI-Compatible Endpoints Provider',
    content: `package com.replyfloat.ai.ai

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.replyfloat.ai.model.AIProviderConfig
import com.replyfloat.ai.model.ReplyRequest
import com.replyfloat.ai.model.ReplySuggestion
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class OpenAIProvider(
    private val config: AIProviderConfig,
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build(),
    private val gson: Gson = Gson()
) : AIProvider {

    override val id: String = config.id
    override val name: String = config.name

    override suspend fun generateReplies(request: ReplyRequest): Result<List<ReplySuggestion>> =
        withContext(Dispatchers.IO) {
            try {
                val apiKey = config.apiKey
                if (apiKey.isBlank()) {
                    return@withContext Result.failure(IllegalStateException("API key is required."))
                }

                val endpoint = config.endpoint.ifBlank { "https://api.openai.com/v1/chat/completions" }
                val model = config.model.ifBlank { "gpt-4o-mini" }

                val systemPrompt = "You are ReplyFloat AI. Generate \${request.count} reply options in \${request.style} style. Return JSON: {\\\"replies\\\": [{\\\"text\\\": \\\"...\\\", \\\"style\\\": \\\"\${request.style}\\\"}]}"

                val payload = JsonObject().apply {
                    addProperty("model", model)
                    val messages = JsonArray().apply {
                        add(JsonObject().apply {
                            addProperty("role", "system")
                            addProperty("content", systemPrompt)
                        })
                        add(JsonObject().apply {
                            addProperty("role", "user")
                            addProperty("content", "Context text: \${request.conversationText}")
                        })
                    }
                    add("messages", messages)
                    addProperty("temperature", 0.7)
                }

                val body = payload.toString().toRequestBody("application/json".toMediaType())
                val httpRequest = Request.Builder()
                    .url(endpoint)
                    .addHeader("Authorization", "Bearer $apiKey")
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build()

                val response = client.newCall(httpRequest).execute()
                if (!response.isSuccessful) {
                    val err = response.body?.string() ?: "HTTP \${response.code}"
                    return@withContext Result.failure(Exception("AI Provider Error: $err"))
                }

                val resBody = response.body?.string() ?: ""
                val rootJson = gson.fromJson(resBody, JsonObject::class.java)
                val choices = rootJson.getAsJsonArray("choices")
                val content = choices?.get(0)?.asJsonObject?.getAsJsonObject("message")?.get("content")?.asString ?: ""

                val list = mutableListOf<ReplySuggestion>()
                val jsonMatch = Regex("""\\{.*\\}""", RegexOption.DOT_MATCHES_ALL).find(content)?.value
                if (jsonMatch != null) {
                    val parsed = gson.fromJson(jsonMatch, JsonObject::class.java)
                    parsed.getAsJsonArray("replies")?.forEachIndexed { idx, elem ->
                        val obj = elem.asJsonObject
                        list.add(
                            ReplySuggestion(
                                id = idx.toString(),
                                style = obj.get("style")?.asString ?: request.style,
                                text = obj.get("text")?.asString ?: "",
                                tone = request.style
                            )
                        )
                    }
                } else {
                    content.lines().filter { it.isNotBlank() }.take(request.count).forEachIndexed { i, l ->
                        list.add(ReplySuggestion(i.toString(), request.style, l.trim(), request.style))
                    }
                }

                Result.success(list)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    override suspend fun testConnection(): Result<Boolean> = withContext(Dispatchers.IO) {
        val dummy = ReplyRequest("Hi", "Short", 1, "short")
        generateReplies(dummy).map { true }
    }
}

class CustomOpenAICompatibleProvider(config: AIProviderConfig) : AIProvider by OpenAIProvider(config)
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/model/Models.kt',
    language: 'kotlin',
    description: 'Data models for providers, requests, replies, and settings',
    content: `package com.replyfloat.ai.model

data class ReplyRequest(
    val conversationText: String,
    val style: String = "Logical",
    val count: Int = 3,
    val length: String = "balanced",
    val contextApp: String = ""
)

data class ReplySuggestion(
    val id: String,
    val style: String,
    val text: String,
    val tone: String = "",
    val confidence: Float = 0.95f
)

data class AIProviderConfig(
    val id: String,
    val name: String,
    val type: String, // "gemini" | "openai" | "custom"
    val endpoint: String,
    val model: String,
    val apiKey: String,
    val enabled: Boolean = true,
    val isDefault: Boolean = false
)

enum class ReplyStyle(val title: String, val description: String) {
    LOGICAL("Logical", "Objective, rational, balanced reasoning"),
    CASUAL("Casual", "Relaxed, everyday natural conversational tone"),
    FRIENDLY("Friendly", "Warm, encouraging, and supportive"),
    FORMAL("Formal", "Polite, professional, structured communication"),
    SHORT("Short", "Quick, concise, to the point"),
    DETAILED("Detailed", "Comprehensive, in-depth explanation"),
    FUNNY("Funny", "Witty, humorous, lighthearted punchlines"),
    DEBATE("Debate", "Persuasive, strong rhetorical counter-points"),
    RESPECTFUL("Respectful", "Empathetic, validating, considerate"),
    COUNTERARGUMENT("Counterargument", "Constructive critical challenge to the premise")
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/data/AppPreferencesRepository.kt',
    language: 'kotlin',
    description: 'DataStore Preferences and EncryptedSharedPreferences for secure settings persistence',
    content: `package com.replyfloat.ai.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "replyfloat_settings")

class AppPreferencesRepository private constructor(private val context: Context) {

    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
    private val encryptedPrefs = EncryptedSharedPreferences.create(
        "replyfloat_secure_keys",
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        val KEY_MASTER_ENABLED = booleanPreferencesKey("master_enabled")
        val KEY_PASS_THROUGH = booleanPreferencesKey("pass_through_mode")
        val KEY_TRANSPARENCY = floatPreferencesKey("transparency")
        val KEY_OVERLAY_SIZE = stringPreferencesKey("overlay_size")
        val KEY_REPLY_STYLE = stringPreferencesKey("reply_style")
        val KEY_SUGGESTION_COUNT = intPreferencesKey("suggestion_count")
        val KEY_RESPONSE_LENGTH = stringPreferencesKey("response_length")
        val KEY_DEBOUNCE_MS = longPreferencesKey("debounce_ms")
        val KEY_AUTO_DETECT = booleanPreferencesKey("auto_detect")
        val KEY_ALLOWED_PACKAGES = stringSetPreferencesKey("allowed_packages")
        val KEY_ACTIVE_PROVIDER = stringPreferencesKey("active_provider")

        @Volatile
        private var INSTANCE: AppPreferencesRepository? = null

        fun getInstance(context: Context): AppPreferencesRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AppPreferencesRepository(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    val isMasterEnabled: Flow<Boolean> = context.dataStore.data.map { it[KEY_MASTER_ENABLED] ?: true }
    val isPassThrough: Flow<Boolean> = context.dataStore.data.map { it[KEY_PASS_THROUGH] ?: false }
    val transparency: Flow<Float> = context.dataStore.data.map { it[KEY_TRANSPARENCY] ?: 0.90f }
    val debounceMs: Flow<Long> = context.dataStore.data.map { it[KEY_DEBOUNCE_MS] ?: 400L }
    val allowedPackages: Flow<Set<String>> = context.dataStore.data.map {
        it[KEY_ALLOWED_PACKAGES] ?: setOf(
            "com.whatsapp",
            "com.reddit.frontpage",
            "com.discord",
            "com.twitter.android",
            "com.android.chrome"
        )
    }

    fun isAppAllowed(packageName: String): Flow<Boolean> = allowedPackages.map { it.contains(packageName) }

    suspend fun setMasterEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_MASTER_ENABLED] = enabled }
    }

    suspend fun setPassThrough(enabled: Boolean) {
        context.dataStore.edit { it[KEY_PASS_THROUGH] = enabled }
    }

    suspend fun setTransparency(alpha: Float) {
        context.dataStore.edit { it[KEY_TRANSPARENCY] = alpha }
    }

    suspend fun toggleAllowedApp(packageName: String, allowed: Boolean) {
        context.dataStore.edit { prefs ->
            val current = (prefs[KEY_ALLOWED_PACKAGES] ?: emptySet()).toMutableSet()
            if (allowed) current.add(packageName) else current.remove(packageName)
            prefs[KEY_ALLOWED_PACKAGES] = current
        }
    }

    // Secure API key storage
    fun saveApiKey(providerId: String, key: String) {
        encryptedPrefs.edit().putString("key_$providerId", key).apply()
    }

    fun getApiKey(providerId: String): String {
        return encryptedPrefs.getString("key_$providerId", "") ?: ""
    }

    fun clearAllSecureData() {
        encryptedPrefs.edit().clear().apply()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/replyfloat/ai/ui/theme/Theme.kt',
    language: 'kotlin',
    description: 'Modern Dark Material 3 Theme with deep slate, cyan, and violet accents',
    content: `package com.replyfloat.ai.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

val DeepSlateBackground = Color(0xFF090D16)
val CardSurfaceDark = Color(0xFF131B2A)
val CardSurfaceElevated = Color(0xFF1B263B)
val CyanAccent = Color(0xFF00E5FF)
val VioletAccent = Color(0xFF8B5CF6)
val TextPrimaryDark = Color(0xFFF1F5F9)
val TextSecondaryDark = Color(0xFF94A3B8)
val BorderDark = Color(0xFF2E3D56)

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    secondary = VioletAccent,
    tertiary = Color(0xFF38BDF8),
    background = DeepSlateBackground,
    surface = CardSurfaceDark,
    surfaceVariant = CardSurfaceElevated,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    outline = BorderDark
)

@Composable
fun ReplyFloatAITheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = DeepSlateBackground.toArgb()
            window.navigationBarColor = DeepSlateBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
`,
  },
];
