
function TryJobResult()
{
    this.tests = [];
    this.slave = "";
    this.url = "";
    this.timestamp = ""; // Date
    this.builder = "";
    this.clobber = false;
    this.project = "";
    this.reason = "";
    this.result = "";
    // this.key = ""; // What is this for?
    this.requester = null; // User
    this.buildnumber = 0;
    this.revision = ""; // Number or HEAD
}

// FIXME: We could probably replace this and the hard coded job lists below with
// usage of the JSON API. ex. http://build.chromium.org/p/tryserver.blink/json/builders
TryJobResult.URL = "http://build.chromium.org/p/{1}/builders/{2}/builds/{3}";

// tryserver.blink
TryJobResult.BLINK_TRY_JOBS = [
    "blink_presubmit",
    "linux_blink_compile_dbg",
    "linux_blink_compile_rel",
    "linux_blink_dbg",
    "linux_blink_oilpan_dbg",
    "linux_blink_oilpan_rel",
    "linux_blink_rel",
    "mac_blink_compile_dbg",
    "mac_blink_compile_rel",
    "mac_blink_dbg",
    "mac_blink_oilpan_dbg",
    "mac_blink_oilpan_rel",
    "mac_blink_rel",
    "win_blink_compile_dbg",
    "win_blink_compile_rel",
    "win_blink_dbg",
    "win_blink_oilpan_dbg",
    "win_blink_oilpan_rel",
    "win_blink_rel",
];

// tryserver.chromium
TryJobResult.CHROMIUM_TRY_JOBS = [
    "android_aosp",
    "android_chromium_gn_compile_dbg",
    "android_chromium_gn_compile_rel",
    "android_clang_dbg",
    "android_dbg",
    "android_fyi_dbg",
    "android_rel",
    "android_x86_dbg",
    "blink_android_compile_dbg",
    "blink_android_compile_rel",
    "chromium_presubmit",
    "cros_amd64",
    "cros_amd64_telemetry",
    "cros_daisy",
    "cros_x86",
    "cros_x86_telemetry",
    "ios_dbg_simulator",
    "ios_rel_device",
    "ios_rel_device_ninja",
    "linux",
    "linux_arm_cross_compile",
    "linux_arm_tester",
    "linux_asan",
    "linux_browser_asan",
    "linux_chromeos",
    "linux_chromeos_asan",
    "linux_chromeos_browser_asan",
    "linux_chromeos_clang",
    "linux_chromeos_valgrind",
    "linux_chromium_chromeos_clang_dbg",
    "linux_chromium_chromeos_clang_rel",
    "linux_chromium_chromeos_dbg",
    "linux_chromium_chromeos_rel",
    "linux_chromium_clang_dbg",
    "linux_chromium_clang_rel",
    "linux_chromium_compile_dbg",
    "linux_chromium_compile_rel",
    "linux_chromium_dbg",
    "linux_chromium_gn_dbg",
    "linux_chromium_gn_rel",
    "linux_chromium_rel",
    "linux_chromium_trusty32_dbg",
    "linux_chromium_trusty32_rel",
    "linux_chromium_trusty_dbg",
    "linux_chromium_trusty_rel",
    "linux_clang",
    "linux_clang_tsan",
    "linux_ecs_ozone",
    "linux_futura",
    "linux_layout",
    "linux_layout_asan",
    "linux_layout_rel",
    "linux_layout_rel_32",
    "linux_nacl_sdk",
    "linux_nacl_sdk_build",
    "linux_redux",
    "linux_rel",
    "linux_rel_alt",
    "linux_rel_naclmore",
    "linux_rel_precise32",
    "linux_tsan",
    "linux_valgrind",
    "mac",
    "mac_asan",
    "mac_asan_64",
    "mac_chromium_compile_dbg",
    "mac_chromium_compile_rel",
    "mac_chromium_dbg",
    "mac_chromium_rel",
    "mac_nacl_sdk",
    "mac_nacl_sdk_alt",
    "mac_nacl_sdk_build",
    "mac_rel",
    "mac_rel_naclmore",
    "mac_valgrind",
    "mac_valgrind_alt",
    "mac_x64_rel",
    "mac_xcodebuild",
    "tools_build_presubmit",
    "win",
    "win8_aura",
    "win_chromium_compile_dbg",
    "win_chromium_compile_rel",
    "win_chromium_dbg",
    "win_chromium_rel",
    "win_chromium_x64_dbg",
    "win_chromium_x64_rel",
    "win_drmemory",
    "win_nacl_sdk",
    "win_nacl_sdk_build",
    "win_rel",
    "win_rel_naclmore",
    "win_tsan",
    "win_x64_rel",
];

// tryserver.chromium.gpu
TryJobResult.CHROMIUM_GPU_TRY_JOBS = [
    "linux_gpu",
    "mac_gpu",
    "mac_gpu_retina",
    "win_gpu",
];

// FIXME: Add these.
// tryserver.skia
TryJobResult.SKIA_TRY_JOBS = [];

// tryserver.v8
TryJobResult.V8_TRY_JOBS = [
    "v8_linux64_rel",
    "v8_linux_arm64_rel",
    "v8_linux_arm_dbg",
    "v8_linux_dbg",
    "v8_linux_layout_dbg",
    "v8_linux_nosnap_dbg",
    "v8_linux_nosnap_rel",
    "v8_linux_rel",
    "v8_mac_rel",
    "v8_win_rel",
];

TryJobResult.TRY_JOB_SERVER_MAP = {};

TryJobResult.RESULT = {
    "-1": "pending",
    "0": "success",
    "1": "warnings",
    "2": "failure",
    "3": "skipped",
    "4": "exception",
    "5": "retry",
    // It's not clear from the Rietveld code if pending is -1 or 6, the server seems to reply with -1?
    "6": "pending",
};

TryJobResult.prototype.getDetailUrl = function()
{
    return this.url;
};

TryJobResult.prototype.getServerName = function()
{
    var map = TryJobResult.TRY_JOB_SERVER_MAP;
    if (!map.initialized) {
        TryJobResult.BLINK_TRY_JOBS.forEach(function(name) {
            map[name] = "tryserver.blink";
        });
        TryJobResult.CHROMIUM_TRY_JOBS.forEach(function(name) {
            map[name] = "tryserver.chromium";
        });
        TryJobResult.CHROMIUM_GPU_TRY_JOBS.forEach(function(name) {
            map[name] = "tryserver.chromium.gpu";
        });
        TryJobResult.SKIA_TRY_JOBS.forEach(function(name) {
            map[name] = "tryserver.skia";
        });
        TryJobResult.V8_TRY_JOBS.forEach(function(name) {
            map[name] = "tryserver.v8";
        });
        map.initialized = true;
    }
    var builder = this.builder.replace("_triggered_tests", "");
    return map[builder] || "";
};

TryJobResult.prototype.parseData = function(data)
{
    var result = this;
    this.tests = (data.tests || []).map(function(name) {
        return new TryJobResultStep(result, name);
    });
    this.slave = data.slave || "";
    this.timestamp = Date.utc.create(data.timestamp);
    this.builder = data.builder || "";
    this.clobber = data.clobber || false;
    this.project = data.project || "";
    this.reason = data.reason || "";
    this.result = TryJobResult.RESULT[data.result] || "";
    this.requester = new User(data.requester);
    this.buildnumber = parseInt(data.buildnumber, 10) || 0;
    this.revision = data.revision || "";
    var serverName = this.getServerName();
    if (serverName) {
        this.url = TryJobResult.URL.assign(
            encodeURIComponent(serverName),
            encodeURIComponent(this.builder),
            this.buildnumber);
    }
};
