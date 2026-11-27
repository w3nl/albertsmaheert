package nl.albertsmaheert.escaperoom;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.InputDevice;
import android.view.InputEvent;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

/**
 * Het Geheim van de Albertsmaheert, als Android-app (telefoon, tablet, Google TV, Chromebook).
 *
 * Het spel staat in de app (assets/game, door de workflow erin gezet) en wordt via een https-adres geladen,
 * zodat opslaan (localStorage) gewoon werkt en er geen internet nodig is.
 *
 * Aanraken en een muis werken zoals in de browser. De afstandsbediening stuurt pijltjes en OK; die gaan als gewone
 * toetsen naar het spel (js/gamepad.js). Een controller (PlayStation, Xbox, Stadia, Switch) geeft de app zelf door als
 * window.__nativePad, in de standaardindeling, omdat de WebView de Gamepad API niet op elk toestel doorgeeft.
 * De Terug-knop vraagt het spel om een stap terug (window.tvBack); op het titelscherm sluit de app.
 * Links naar albertsmaheert.nl openen in de browser van het toestel.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/game/index.html";

    private WebView web;
    private final boolean[] buttons = new boolean[17];
    private final int[] presses = new int[17];
    private final float[] axes = new float[4];
    private String lastPad = "";
    private boolean padQueued = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                // het reserveringsformulier in het spel is een iframe: dat blijft gewoon in de app
                if (!request.isForMainFrame() || HOST.equals(url.getHost())) return false;
                openOutside(url);
                return true;
            }
        });
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        setContentView(web);
        hideSystemBars();
        if (state == null) web.loadUrl(START);
        else web.restoreState(state);
        web.requestFocus();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    /** Een link naar de website: in de browser. Op een tv zonder browser een melding met het adres. */
    private void openOutside(Uri url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, url).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, getString(R.string.no_browser, url.getHost() + url.getPath()), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    private static boolean fromController(InputEvent e) {
        int src = e.getSource();
        return (src & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
                || (src & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    /** Android-knop naar de knop in de standaardindeling (zoals in js/gamepad.js), of -1. */
    private static int standardButton(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BUTTON_A: return 0;      // ✕ / A: klikken
            case KeyEvent.KEYCODE_BUTTON_B: return 1;      // ○ / B: terug
            case KeyEvent.KEYCODE_BUTTON_X: return 2;      // □ / X: hint
            case KeyEvent.KEYCODE_BUTTON_Y: return 3;      // △ / Y: toon alle klikplekken
            case KeyEvent.KEYCODE_BUTTON_L1: return 4;     // L1/R1 (en L2/R2): door de rugzak
            case KeyEvent.KEYCODE_BUTTON_R1: return 5;
            case KeyEvent.KEYCODE_BUTTON_L2: return 6;
            case KeyEvent.KEYCODE_BUTTON_R2: return 7;
            case KeyEvent.KEYCODE_BUTTON_SELECT: return 8;
            case KeyEvent.KEYCODE_BUTTON_START: return 9;  // Start: menu
            case KeyEvent.KEYCODE_DPAD_UP: return 12;
            case KeyEvent.KEYCODE_DPAD_DOWN: return 13;
            case KeyEvent.KEYCODE_DPAD_LEFT: return 14;
            case KeyEvent.KEYCODE_DPAD_RIGHT: return 15;
            default: return -1;
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        boolean down = e.getAction() == KeyEvent.ACTION_DOWN;
        if (e.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            // De Terug-knop: het spel doet een stap terug; op het titelscherm sluit de app.
            if (!down && e.getRepeatCount() == 0) {
                web.evaluateJavascript("window.tvBack ? window.tvBack() : false", value -> {
                    if ("true".equals(value)) return;
                    // op de privacypagina (privacy.html in de app): Terug gaat naar het spel, niet uit de app
                    String url = web.getUrl();
                    if (url != null && !url.endsWith("/index.html") && web.canGoBack()) web.goBack();
                    else finish();
                });
            }
            return true;
        }
        if (fromController(e)) {
            int b = standardButton(e.getKeyCode());
            if (b >= 0) {
                if (buttons[b] != down) { buttons[b] = down; if (down) presses[b]++; sendPad(); }
                return true;
            }
        }
        return super.dispatchKeyEvent(e);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent e) {
        if (fromController(e) && e.getAction() == MotionEvent.ACTION_MOVE) {
            axes[0] = e.getAxisValue(MotionEvent.AXIS_X);
            axes[1] = e.getAxisValue(MotionEvent.AXIS_Y);
            axes[2] = e.getAxisValue(MotionEvent.AXIS_Z);
            axes[3] = e.getAxisValue(MotionEvent.AXIS_RZ);
            // de pijltjes van een PlayStation-controller komen vaak als "hat"-as binnen
            float hx = e.getAxisValue(MotionEvent.AXIS_HAT_X), hy = e.getAxisValue(MotionEvent.AXIS_HAT_Y);
            hat(14, hx < -.5f); hat(15, hx > .5f); hat(12, hy < -.5f); hat(13, hy > .5f);
            sendPad();
            return true;
        }
        return super.dispatchGenericMotionEvent(e);
    }

    private void hat(int b, boolean on) {
        if (on && !buttons[b]) presses[b]++;
        buttons[b] = on;
    }

    /** Stuur de stand van de controller naar het spel, hoogstens één keer per beeld (een stick geeft honderden kleine bewegingen). */
    private void sendPad() {
        if (padQueued) return;
        padQueued = true;
        web.postOnAnimation(this::flushPad);
    }

    private void flushPad() {
        padQueued = false;
        StringBuilder js = new StringBuilder("window.__nativePad={buttons:[");
        for (int i = 0; i < buttons.length; i++) js.append(i > 0 ? "," : "").append(buttons[i] ? 1 : 0);
        js.append("],presses:[");
        for (int i = 0; i < presses.length; i++) js.append(i > 0 ? "," : "").append(presses[i]);
        js.append("],axes:[");
        for (int i = 0; i < axes.length; i++) {
            float a = Float.isNaN(axes[i]) ? 0 : Math.round(axes[i] * 100) / 100f; // afgerond: geen ruis doorsturen
            js.append(i > 0 ? "," : "").append(a);
        }
        js.append("]};");
        String out = js.toString();
        if (out.equals(lastPad)) return;
        lastPad = out;
        web.evaluateJavascript(out, null);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
