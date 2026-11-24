// De Android-app van de escaperoom (telefoon, tablet, Google TV en Chromebook): een kleine app die het spel laat zien
// (uit de map assets/game, die de workflow "Escaperoom-apps" vult met src/escaperoom). Zie docs/escaperoom-apps.md.
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AlbertsmaheertEscaperoom"
include(":app")
