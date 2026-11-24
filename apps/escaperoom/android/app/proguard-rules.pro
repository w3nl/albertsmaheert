# R8-regels voor de escaperoom-app (alleen de release-bundel).
# De app heeft één Activity (blijft vanzelf bewaard via het manifest) en praat met het spel alleen via
# WebView.evaluateJavascript: er is geen JavaScript-interface om te bewaren.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
