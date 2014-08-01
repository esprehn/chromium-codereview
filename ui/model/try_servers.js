"use strict";

var TryServers = (function() {
    var servers = [
        {
            master: "tryserver.blink",
            builders: [
                "android_blink_compile_dbg",
                "android_blink_compile_rel",
                "android_chromium_gn_compile_rel",
                "blink_presubmit",
                "linux_blink_compile_dbg",
                "linux_blink_compile_rel",
                "linux_blink_dbg",
                "linux_blink_oilpan_dbg",
                "linux_blink_oilpan_rel",
                "linux_blink_rel",
                "linux_chromium_gn_rel",
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
            ],
        },
        {
            master: "tryserver.chromium.linux",
            builders: [
                "android_aosp",
                "android_chromium_gn_compile_dbg",
                "android_chromium_gn_compile_rel",
                "android_clang_dbg",
                "android_dbg",
                "android_dbg_recipe",
                "android_fyi_dbg",
                "android_rel",
                "android_x86_dbg",
                "blink_android_compile_dbg",
                "blink_android_compile_rel",
                "blink_presubmit",
                "chromium_presubmit",
                "linux_arm_cross_compile",
                "linux_arm_tester",
                "linux_asan",
                "linux_browser_asan",
                "linux_chromeos_asan",
                "linux_chromeos_browser_asan",
                "linux_chromeos_valgrind",
                "linux_chromium_chromeos_clang_dbg",
                "linux_chromium_chromeos_clang_rel",
                "linux_chromium_chromeos_dbg",
                "linux_chromium_chromeos_ozone_dbg",
                "linux_chromium_chromeos_ozone_rel",
                "linux_chromium_chromeos_rel",
                "linux_chromium_chromeos_rel_swarming",
                "linux_chromium_clang_dbg",
                "linux_chromium_clang_rel",
                "linux_chromium_compile_dbg",
                "linux_chromium_compile_rel",
                "linux_chromium_dbg",
                "linux_chromium_gn_dbg",
                "linux_chromium_gn_rel",
                "linux_chromium_rel",
                "linux_chromium_rel_swarming",
                "linux_chromium_trusty32_dbg",
                "linux_chromium_trusty32_rel",
                "linux_chromium_trusty_dbg",
                "linux_chromium_trusty_rel",
                "linux_clang_tsan",
                "linux_ecs_ozone",
                "linux_layout",
                "linux_layout_asan",
                "linux_layout_rel",
                "linux_layout_rel_32",
                "linux_nacl_sdk",
                "linux_nacl_sdk_bionic",
                "linux_nacl_sdk_bionic_build",
                "linux_nacl_sdk_build",
                "linux_redux",
                "linux_rel_naclmore",
                "linux_rel_precise32",
                "linux_valgrind",
                "tools_build_presubmit",
            ],
        },
        {
            master: "tryserver.chromium.mac",
            builders: [
                "ios_dbg_simulator",
                "ios_rel_device",
                "ios_rel_device_ninja",
                "mac_asan",
                "mac_asan_64",
                "mac_chromium_compile_dbg",
                "mac_chromium_compile_rel",
                "mac_chromium_dbg",
                "mac_chromium_rel",
                "mac_chromium_rel_swarming",
                "mac_nacl_sdk",
                "mac_nacl_sdk_build",
                "mac_rel_naclmore",
                "mac_valgrind",
                "mac_x64_rel",
                "mac_xcodebuild",
            ],
        },
        {
            master: "tryserver.chromium.win",
            builders: [
                "win8_aura",
                "win8_chromium_dbg",
                "win8_chromium_rel",
                "win_chromium_compile_dbg",
                "win_chromium_compile_rel",
                "win_chromium_dbg",
                "win_chromium_rel",
                "win_chromium_rel_swarming",
                "win_chromium_x64_dbg",
                "win_chromium_x64_rel",
                "win_drmemory",
                "win_nacl_sdk",
                "win_nacl_sdk_build",
                "win_rel_naclmore",
            ],
        },
        {
            master: "tryserver.chromium.gpu",
            builders: [
                "linux_gpu",
                "mac_gpu",
                "win_gpu",
            ],
        },
        // FIXME: Add these.
        // {
        //     master:"tryserver.skia",
        //     builders: [],
        // },
        {
            master: "tryserver.v8",
            builders: [
                "v8_linux64_rel",
                "v8_linux_arm64_rel",
                "v8_linux_arm_dbg",
                "v8_linux_dbg",
                "v8_linux_layout_dbg",
                "v8_linux_nosnap_dbg",
                "v8_linux_nosnap_rel",
                "v8_linux_rel",
                "v8_mac_rel",
                "v8_win64_rel",
                "v8_win_rel",
            ],
        },
    ];

    var builderToMasterMap = {};
    servers.forEach(function(server) {
        server.builders.forEach(function(builder) {
            builderToMasterMap[builder] = server.master;
        });
    });

    function createFlagValue(builders) {
        return builders.map(function(builder) {
            return builderToMasterMap[builder] + ":" + builder;
        }).join(",");
    }

    return {
        SERVERS: servers,
        BUILDER_TO_MASTER: builderToMasterMap,
        createFlagValue: createFlagValue,
    };
})();
