# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Keep line numbers so the mapping file uploaded to Play can turn obfuscated
# release stack traces back into readable ones, and rewrite the source file
# name so the original file names are not leaked in the bundle.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Capacitor's plugin dispatch, the permission/activity callbacks, and Gson's
# field mapping all read annotations and generic signatures at runtime; R8
# strips those attributes by default.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod

# The Capacitor bridge is reached from JavaScript in the WebView, so these
# methods have no reachable caller in the Java graph.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# com.auth0.android:jwtdecode (pulled in by @capgo/capacitor-social-login)
# deserializes JWT claims into its own model types via Gson reflection and,
# unlike capacitor-android / sqlcipher-android / gson, ships no consumer rules.
-keep class com.auth0.android.jwt.** { *; }
