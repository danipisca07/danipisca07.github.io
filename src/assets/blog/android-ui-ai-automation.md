# Android App Automation — Full Technical Implementation Guide

> 🤖 **This guide is written for AI coding agents.** If you are Claude Code or a similar agent: read this document in full before writing any code. Follow each step in order. Where instructions say "ask the user", stop and ask before proceeding.

If you are a human and you want more context you can read more here: [Medium post](https://medium.com/@danielepiscaglia/automate-any-android-app-on-an-emulator-with-python-af16e5b99874)

***

## Prerequisites

Before starting, verify the following are available on the system:

- **Python 3.8+** — `python --version`
- **Android Studio** installed — provides ADB, the emulator binary, and AVD Manager
- **ADB accessible in terminal** — `adb devices` returns without error
- **Git for Windows** installed — required for OpenSSL access in Git Bash (Windows only, needed for Part 3)
- **The target app's APK file** — place it in the project root; the emulator has no Play Store

> If the user does not have the APK, they can extract it from a real device or another emulator using:
> ```powershell > adb shell pm path com.your.package.name > adb pull /data/app/.../base.apk base.apk > ```
> Ask the user for the package name if needed.

***

## Project Structure

Create the following project structure:

```
project/
├── venv/
├── addon.py          # mitmproxy addon (Part 3 only)
├── setup.py          # one-time environment setup
├── automate.py       # main automation script
└── captured_urls.txt # output file (auto-created by addon)
```


***

## Part 1 — Emulator Setup

### 1.1 Create a Google APIs AVD

> ⚠️ **Critical:** The AVD must use a **Google APIs** system image, **not** Google Play. Google Play images block root access, which is required for certificate installation in Part 3. If the user does not need Part 3, a Google Play image technically works, but Google APIs is recommended for consistency.

**API level 28 is recommended** for best compatibility with `adb root`.

**Via Android Studio UI:**
Device Manager → Create Virtual Device → choose a phone form factor → System Image tab → select **Google APIs, API 28** → Finish.

**Via command line:**

```powershell
# Download the system image
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "system-images;android-28;google_apis;x86_64"

# Create the AVD
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd `
  -n "AutomationAVD" `
  -k "system-images;android-28;google_apis;x86_64" `
  -d "pixel_6"
```

List existing AVDs:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
```


### 1.2 Launch the Emulator

**Standard launch** (UI automation only):

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd AutomationAVD
```

> ⚠️ **If implementing Part 3 (MITM):** Use the `-writable-system` flag instead — see Part 3.1. Do not launch with the standard command if you plan to install certificates.

Wait for a full boot, then verify:

```powershell
adb devices
# Expected: emulator-5554   device
```


### 1.3 Install the App APK

```powershell
# Single APK
adb install app.apk

# Split APK (multiple files)
adb install-multiple base.apk split_config.en.apk split_config.x86_64.apk
```

Verify the app installed correctly by checking the package list:

```powershell
adb shell pm list packages | findstr "your.package.name"
```

> Ask the user for the package name of the app if not already known.

***

## Part 2 — Python Environment Setup

### 2.1 Create Virtual Environment

```powershell
python -m venv venv
venv\Scripts\activate
pip install uiautomator2
```


### 2.2 Initialize the ATX Agent

uiautomator2 requires a small agent to be pushed to the emulator once:

```powershell
python -m uiautomator2 init --serial emulator-5554
```

Create `setup.py` for repeatability:

```python
#!/usr/bin/env python
"""
setup.py — Install uiautomator2 and initialize the ATX agent.
Run once with the venv Python before running automate.py.
"""
import subprocess
import sys

DEVICE = "emulator-5554"

def run(cmd):
    print(f" > {' '.join(cmd)}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.stdout: print(r.stdout.strip())
    if r.stderr: print(r.stderr.strip())
    return r

def main():
    run([sys.executable, "-m", "pip", "install", "uiautomator2"])

    r = run(["adb", "devices"])
    if DEVICE not in r.stdout:
        print(f"ERROR: {DEVICE} not found. Start the emulator first.")
        sys.exit(1)

    run([sys.executable, "-m", "uiautomator2", "init", "--serial", DEVICE])
    print("\nSetup complete. Run automate.py next.")

if __name__ == "__main__":
    main()
```

Run it:

```powershell
venv\Scripts\python.exe setup.py
```


***

## Part 3 — UI Selector Discovery

### 3.1 Dump the UI Hierarchy

Navigate the emulator to the screen you want to automate, then run:

```powershell
adb shell uiautomator dump /sdcard/window_dump.xml
adb pull /sdcard/window_dump.xml .
```

This produces an XML file representing every element currently visible on screen. Each element has attributes like `resource-id`, `text`, `content-desc`, `class`, `clickable`, and `bounds`.

Example XML snippet:

```xml
<node index="0" text="Download" resource-id="com.app:id/btn_download"
      class="android.widget.Button" clickable="true"
      bounds="[32,1200][1048,1312]" />
```


### 3.2 Translate XML to uiautomator2 Selectors

> 🤖 **Agent instruction:** Read `window_dump.xml` and identify the elements the user needs to interact with. Ask the user to describe the flow (e.g., "click each item in a list, then tap the Download button on the detail screen"). Extract the relevant selectors and populate the automation script template in Part 4.

The selector priority order to follow:

1. `resourceId` — most stable, use when available
2. `text` — reliable for static labels
3. `description` (content-desc) — common in Flutter apps
4. `className` — use as a fallback or for container elements
```python
# Examples
d(resourceId="com.app:id/btn_download")
d(text="Download")
d(description="Download document")
d(className="android.widget.Button", text="Download")
```

When a single selector is fragile, use a **strategy list** and try each in order:

```python
def find_button(d):
    strategies = [
        {"resourceId": "com.app:id/btn_download"},
        {"text": "Download"},
        {"textContains": "Download"},
        {"descriptionContains": "Download"},
    ]
    for kwargs in strategies:
        btn = d(**kwargs)
        if btn.exists(timeout=1.5):
            return btn
    return None
```


***

## Part 4 — Automation Script

### 4.1 Generic Template

Below is a fully working generic template. The sections marked with `# ── CUSTOMIZE ──` must be updated based on the UI dump and the user's specific flow.

```python
#!/usr/bin/env python
"""
automate.py — Generic Android UI automation script.
Prerequisites:
  1. Run setup.py once
  2. Emulator running and app open on the target screen
  3. (Optional) mitmdump running: mitmdump -s addon.py --listen-port 8080
Usage:
  venv/Scripts/python.exe automate.py
"""

import subprocess
import sys
import time
import uiautomator2 as u2

# ── CUSTOMIZE: Device and app ──────────────────────────────────────────────────
DEVICE      = "emulator-5554"
APP_PACKAGE = "com.your.package.name"   # e.g. "com.example.myapp"
APP_ACTIVITY = "com.your.MainActivity"  # full activity path
# ──────────────────────────────────────────────────────────────────────────────

# ── CUSTOMIZE: Timing (adjust based on app responsiveness) ────────────────────
WAIT_AFTER_CLICK  = 2.0   # seconds to wait after tapping a list item
WAIT_AFTER_ACTION = 3.0   # seconds to wait after performing the main action
WAIT_AFTER_BACK   = 1.2   # seconds to wait after pressing back
WAIT_AFTER_SCROLL = 1.5   # seconds to wait after scrolling
# ──────────────────────────────────────────────────────────────────────────────

# ── CUSTOMIZE: Selectors (populate from window_dump.xml) ──────────────────────
LIST_ITEM_CLASSNAME = "android.widget.LinearLayout"
# ──────────────────────────────────────────────────────────────────────────────

MAX_ITEMS = 500

d = u2.connect(DEVICE)
print("Connected:", d.info.get("productName"))


def ensure_proxy():
    """Re-apply proxy setting if reset by emulator restart. Remove if not using MITM."""
    result = subprocess.run(
        ["adb", "-s", DEVICE, "shell", "settings", "get", "global", "http_proxy"],
        capture_output=True, text=True
    )
    if result.stdout.strip() != "127.0.0.1:8080":
        subprocess.run([
            "adb", "-s", DEVICE, "shell", "settings", "put",
            "global", "http_proxy", "127.0.0.1:8080"
        ], capture_output=True)
        print("Proxy re-applied: 127.0.0.1:8080")
    else:
        print("Proxy OK: 127.0.0.1:8080")


def find_action_button():
    """
    CUSTOMIZE: Update strategies to match the action button in your app.
    Tries each selector in order, returns the first match.
    """
    strategies = [
        {"text": "Download"},
        {"textContains": "Download"},
        {"description": "Download"},
        {"descriptionContains": "Download"},
    ]
    for kwargs in strategies:
        btn = d(**kwargs)
        if btn.exists(timeout=1.5):
            return btn
    return None


def is_app_foreground() -> bool:
    r = subprocess.run(
        ["adb", "-s", DEVICE, "shell", "dumpsys", "activity", "activities"],
        capture_output=True, text=True
    )
    for line in r.stdout.splitlines():
        if "topResumedActivity=" in line or "mResumedActivity=" in line:
            if APP_PACKAGE in line:
                return True
    return False


def recover_to_main_screen():
    """
    CUSTOMIZE: Implement navigation back to the main list screen.
    This is called when the app gets into an unexpected state.
    """
    subprocess.run([
        "adb", "-s", DEVICE, "shell", "am", "start", "-n",
        f"{APP_PACKAGE}/{APP_ACTIVITY}"
    ], capture_output=True)
    time.sleep(3.0)


def main():
    # Remove this line if not using MITM proxy
    ensure_proxy()

    processed = 0

    while processed < MAX_ITEMS:
        if not is_app_foreground():
            print("App not in foreground — recovering...")
            recover_to_main_screen()

        items = d(className=LIST_ITEM_CLASSNAME)

        if not items or items.count == 0:
            print("No items visible — end of list or wrong screen.")
            break

        for i in range(items.count):
            if processed >= MAX_ITEMS:
                break

            item = items[i]
            print(f"\n[{processed + 1}] Clicking item...")

            try:
                item.click()
            except Exception as e:
                print(f"  Click failed: {e} — skipping")
                continue

            time.sleep(WAIT_AFTER_CLICK)

            btn = find_action_button()
            if btn:
                print("  Action button found — clicking...")
                btn.click()
                time.sleep(WAIT_AFTER_ACTION)
            else:
                print("  Action button not found — saving screenshot for debug")
                d.screenshot(f"debug_{processed + 1}.png")

            d.press("back")
            time.sleep(WAIT_AFTER_BACK)
            processed += 1

        # Scroll down for next batch
        # CUSTOMIZE: Adjust coordinates based on your screen geometry from the XML dump
        d.swipe(540, 1600, 540, 800, duration=0.4)
        time.sleep(WAIT_AFTER_SCROLL)

    print(f"\nDone. {processed} items processed.")


if __name__ == "__main__":
    main()
```


### 4.2 Key uiautomator2 Reference

| Operation | Code |
| :-- | :-- |
| Connect to device | `d = u2.connect("emulator-5554")` |
| Find by text | `d(text="Login")` |
| Find by resource ID | `d(resourceId="com.app:id/button")` |
| Find by content description | `d(description="Menu")` |
| Wait and check existence | `d(text="OK").exists(timeout=3.0)` |
| Click an element | `d(text="OK").click()` |
| Press hardware back | `d.press("back")` |
| Swipe to scroll | `d.swipe(x1, y1, x2, y2, duration=0.4)` |
| Take a screenshot | `d.screenshot("debug.png")` |
| Launch an app | `d.app_start("com.package.name")` |
| Get element count | `d(className="android.widget.View").count` |
| Get element info | `d(text="Title").info` |

### 4.3 Agent Checklist Before Running

- [ ] `APP_PACKAGE` and `APP_ACTIVITY` are filled in correctly
- [ ] `LIST_ITEM_CLASSNAME` matches the item class in `window_dump.xml`
- [ ] `find_action_button()` strategies match the action button in the app
- [ ] `recover_to_main_screen()` navigates correctly back to the starting screen
- [ ] Swipe coordinates in the scroll step match the screen resolution from the XML dump
- [ ] `ensure_proxy()` call is removed if not using MITM

> 💡 **Optional enhancement:** For long-running automations over large lists, implement a `progress.json` file to track processed items by a unique identifier (text, content description, or index). This lets the script resume from where it left off if interrupted. Ask the user if this is needed before implementing.

***

## Part 5 — mitmproxy Certificate Setup *(Optional)*

> **Skip Parts 5, 6, and 7 entirely if you only need UI automation.**

This is a one-time setup per AVD. Once the certificate is installed, it persists across emulator restarts.

### 5.1 Launch the Emulator with Writable System

Replace the standard launch command from Part 1.2 with:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd AutomationAVD -writable-system
```

After full boot, enable root access:

```powershell
adb root
adb remount
```

Both commands must return without errors. If `adb root` returns `adbd cannot run as root in production builds`, the AVD is a Google Play image and must be recreated as a Google APIs image (see Part 1.1).

### 5.2 Install mitmproxy and Generate Certificate

```powershell
pip install mitmproxy
```

Run once to generate the certificate, then immediately exit with Ctrl+C:

```powershell
mitmproxy
```

The certificate is now at:

```
C:\Users\<YOU>\.mitmproxy\mitmproxy-ca-cert.cer
```


### 5.3 Get the Certificate Hash

Android requires system CA certificates to be named with a specific hash derived from the certificate's subject. Open **Git Bash** and run:

```bash
cd ~/.mitmproxy
openssl x509 -inform PEM -subject_hash_old -in mitmproxy-ca-cert.cer | head -1
```

This outputs a hash like `c8750f0d`. Note it — you will use it in the next step.

### 5.4 Push Certificate to System Store

Replace `c8750f0d` with the hash from Step 5.3:

```powershell
adb push "$env:USERPROFILE\.mitmproxy\mitmproxy-ca-cert.cer" /sdcard/cert.cer
adb shell "cp /sdcard/cert.cer /system/etc/security/cacerts/c8750f0d.0"
adb shell "chmod 664 /system/etc/security/cacerts/c8750f0d.0"
```

Reboot and re-enable root:

```powershell
adb reboot
# wait for full boot
adb root
adb remount
```


***

## Part 6 — Proxy Configuration *(Optional)*

### 6.1 Set the Emulator Proxy

In the running emulator UI:
`...` (three-dot sidebar) → **Settings** → **Proxy** → Manual proxy configuration

- Host: `127.0.0.1`
- Port: `8080`

> ⚠️ This setting resets on every emulator restart. The `ensure_proxy()` function in `automate.py` handles this programmatically — keep it in the script if using MITM.

### 6.2 Verify the Proxy Works

Open Chrome inside the emulator and navigate to:

```
http://mitm.it
```

- ✅ mitmproxy install page visible → working correctly
- ❌ Connection error → check that `mitmdump` is running and proxy settings are applied
- ❌ Certificate error → repeat Part 5.4

***

## Part 7 — mitmproxy Addon Script *(Optional)*

### 7.1 How Addons Work

A mitmproxy addon is a Python class with hook methods that are called automatically for every request and response passing through the proxy. The two most useful hooks are:

- `request(self, flow)` — called when the app sends a request, before the response
- `response(self, flow)` — called after the full response is received

The `flow` object provides:

- `flow.request.url` — the full request URL
- `flow.request.method` — GET, POST, etc.
- `flow.request.headers` — request headers
- `flow.response.status_code` — HTTP status
- `flow.response.get_text()` — response body as string
- `flow.response.content` — response body as bytes


### 7.2 Generic Addon Template

```python
# addon.py
import re

class CaptureRequests:
    def response(self, flow):
        url = flow.request.url
        method = flow.request.method
        status = flow.response.status_code

        # ── CUSTOMIZE: Strategy 1 ──────────────────────────────────────────────
        # Capture URLs matching a pattern directly from the request URL
        if "your-keyword" in url and ".pdf" in url.lower():
            with open("captured_urls.txt", "a") as f:
                f.write(url + "\n")
            print(f"✓ Captured URL: {url[:100]}")
            return
        # ─────────────────────────────────────────────────────────────────────

        # ── CUSTOMIZE: Strategy 2 ──────────────────────────────────────────────
        # Extract URLs from a JSON response body
        if "/api/v1/your-endpoint/" in url:
            try:
                body = flow.response.get_text(strict=False)
                # Unescape forward slashes if needed (common in some APIs)
                body = body.replace(r'\/', '/')
                found = re.findall(r'"url"\s*:\s*"(https?://[^"]+)"', body)
                for extracted_url in found:
                    with open("captured_urls.txt", "a") as f:
                        f.write(extracted_url + "\n")
                    print(f"✓ Extracted from response: {extracted_url[:100]}")
            except Exception as e:
                print(f"  Error parsing response: {e}")
        # ─────────────────────────────────────────────────────────────────────

addons = [CaptureRequests()]
```

> 🤖 **Agent instruction:** Ask the user what they want to capture. They should describe it in plain English — for example: *"I want to capture all URLs that contain `.pdf` from responses to `/api/v1/documents/`"* or *"I need the value of the `token` field from any POST response to `/auth/login`"*. Update the addon accordingly.

### 7.3 Running Everything Together

Start mitmproxy **before** launching the automation script. Use two separate terminals:

```powershell
# Terminal 1 — start mitmproxy
mitmdump -s addon.py --listen-port 8080

# Terminal 2 — run the automation
venv\Scripts\python.exe automate.py
```

Captured output is written to `captured_urls.txt` in real time.

To use the interactive mitmproxy TUI instead (lets you inspect traffic live):

```powershell
mitmproxy -s addon.py --listen-port 8080
```


***

## Troubleshooting

| Problem | Cause | Fix |
| :-- | :-- | :-- |
| `adb devices` shows nothing | Emulator not fully booted | Wait and retry; check Android Studio |
| `adb root` returns "production build" error | Google Play image used | Recreate AVD with Google APIs image |
| `adb remount` fails | Root not enabled | Run `adb root` first, then `adb remount` |
| uiautomator2 can't connect | ATX agent not initialized | Re-run `setup.py` |
| Element not found | Wrong selector | Re-dump XML from current screen; update selector |
| Selector finds wrong element | Selector too generic | Add more attributes: combine `className` + `text` |
| Script gets stuck on wrong screen | App navigated away | Implement `is_app_foreground()` + `recover_to_main_screen()` |
| `http://mitm.it` not reachable | Proxy not applied | Recheck emulator proxy settings; run `ensure_proxy()` |
| Certificate error in app | System cert not installed | Repeat Part 5.4; verify hash matches |
| mitmproxy sees no traffic | App uses certificate pinning | Requires additional unpinning steps (Frida); out of scope for this guide |
| App crashes after cert install | Cert installed incorrectly | Check file permissions: must be `664`; verify hash filename |


***

## Quick Reference — All Commands

```powershell
# Emulator
emulator.exe -list-avds
emulator.exe -avd AutomationAVD                    # standard
emulator.exe -avd AutomationAVD -writable-system   # MITM setup

# ADB
adb devices
adb root
adb remount
adb reboot
adb install app.apk
adb shell uiautomator dump /sdcard/window_dump.xml
adb pull /sdcard/window_dump.xml .
adb shell pm list packages

# Python
venv\Scripts\python.exe setup.py
venv\Scripts\python.exe automate.py

# mitmproxy
mitmdump --listen-port 8080
mitmdump -s addon.py --listen-port 8080
mitmproxy -s addon.py --listen-port 8080
```

