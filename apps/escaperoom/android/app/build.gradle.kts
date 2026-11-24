plugins {
    id("com.android.application")
}

// Optioneel een vaste sleutel (repository-secrets ESCAPEROOM_KEYSTORE_BASE64 + ESCAPEROOM_KEYSTORE_PASSWORD), zodat een
// nieuwe versie over de oude heen geïnstalleerd kan worden. Zonder die sleutel ondertekent GitHub met een wisselende
// debugsleutel: dan eerst de oude app verwijderen. Zie docs/escaperoom-apps.md.
val keystoreFile = rootProject.file("keystore.jks")
val keystorePassword: String? = System.getenv("ESCAPEROOM_KEYSTORE_PASSWORD")?.takeIf { it.isNotEmpty() }
val keyAliasName: String = System.getenv("ESCAPEROOM_KEY_ALIAS")?.takeIf { it.isNotBlank() } ?: "albertsmaheert"
// Het versienummer volgt het spel: GAME_VERSION 63 wordt 1.63 (de workflow geeft het door).
val gameVersion: Int = (System.getenv("GAME_VERSION") ?: "1").toInt()

android {
    // De pakketnaam is blijvend: Google Play en Android herkennen de app eraan. Niet meer veranderen na de eerste uitgave.
    namespace = "nl.albertsmaheert.escaperoom"
    compileSdk = 36

    defaultConfig {
        applicationId = "nl.albertsmaheert.escaperoom"
        minSdk = 24
        targetSdk = 36
        // altijd hoger dan de vorige build: het spelnummer maal duizend plus de run van de workflow
        versionCode = gameVersion * 1000 + ((System.getenv("GITHUB_RUN_NUMBER") ?: "0").toInt() % 1000)
        versionName = "1.$gameVersion"
    }

    signingConfigs {
        if (keystoreFile.exists() && keystorePassword != null) {
            create("upload") {
                storeFile = keystoreFile
                storePassword = keystorePassword
                keyAlias = keyAliasName
                keyPassword = keystorePassword
            }
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfigs.findByName("upload")?.let { signingConfig = it }
        }
        // De bundel (.aab) voor Google Play, ondertekend met dezelfde vaste sleutel (de uploadsleutel).
        getByName("release") {
            signingConfigs.findByName("upload")?.let { signingConfig = it }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.18.0")
}
