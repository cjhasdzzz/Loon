/**
 * 虎扑净化与增强综合脚本 (Loon Script v2 专用)
 * 1. 底部导航栏仅保留首页(home)与我的(more)
 * 2. 预览横幅清空 & 热门列表顶部横幅移除
 * 3. 个人主页 VIP 与等级视觉改造
 * 4. 论坛功能入口移除多余图标 & "我的应用"卡片
 */
let url = $request.url;
let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 1. 底部导航栏：仅保留首页(home)与我的(more)
        if (url.includes("/nav/getBottomNav") && obj?.result?.normals?.navItems) {
            obj.result.normals.navItems = obj.result.normals.navItems
                .filter(item => item.code === "home" || item.code === "more")
                .map((item, index) => {
                    item.order = index + 1;
                    return item;
                });

            obj.result.normals.type = 2;
            obj.result.navVersion = "E_" + Date.now();
        }
        // 2. 预览横幅：清空数据 (.data = null)
        else if (url.includes("/mang/preview/banners")) {
            obj.data = null;
        }
        // 3. 热门列表：移除顶部横幅 (del(.result.topBanner))
        else if (url.includes("/buffer/hotList") && obj?.result) {
            delete obj.result.topBanner;
        }
        // 4. 个人主页：VIP 与等级视觉改造
        else if (url.includes("/bplapi/user/") && obj?.result) {
            const res = obj.result;

            res.vipInfo = {
                ...(res.vipInfo || {}),
                "hasVip": true,
                "expiredTime": "2099-12-31",
                "iconText": "已开通",
                "textInfo": "尊贵会员 · 2099-12-31到期",
                "vipColor": "#D4AF37",
                "vipNightColor": "#D4AF37",
                "vipCardType": 1,
                "vipCode": "hupu_vip",
                "schema": "huputiyu://webview/openencodeurl?fullscreen=1&url=https%3A%2F%2Foffline-download.hupu.com%2Fonline%2Fprod%2F320001%2Findex.html%3Fentrance%3D1%23%2F%3FmembershipTab%3Dhupu"
            };

            res.redVipInfo = {
                ...(res.redVipInfo || {}),
                "hasVip": true,
                "expiredTime": "2099-12-31",
                "iconText": "已开通",
                "textInfo": "红单会员 · 2099-12-31到期",
                "schema": "huputiyu://webview/openencodeurl?fullscreen=1&url=https%3A%2F%2Foffline-download.hupu.com%2Fonline%2Fprod%2F320001%2Findex.html%3Fentrance%3D1%23%2F%3FmembershipTab%3Dred"
            };

            if (res.userLevel) {
                res.userLevel.bbsUserLevel = "99";
                res.userLevel.bbsUserLevelDesc = "传奇名宿";
                res.userLevel.bbsUserLevelColor = "#FF3B30";
            }
            if (res.fameInfo) {
                res.fameInfo.fameValue = 99999;
            }
            res.regTimeStr = "加入虎扑9999天";
        }
        // 5. 论坛功能入口：移除多余图标 & "我的应用"卡片
        else if (url.includes("/bbsallapi/lego/data") && Array.isArray(obj?.data?.cards)) {
            const blockTitles = ["个性换肤", "专家预测", "邀请好友", "版主中心", "JRs战术板", "草稿箱", "58同城"];
            obj.data.cards = obj.data.cards
                .map(card => {
                    if (card.code === "multiIcon" && Array.isArray(card.components)) {
                        card.components = card.components.filter(comp => !blockTitles.includes(comp?.data?.title));
                    }
                    return card;
                })
                .filter(card => {
                    if (Array.isArray(card.components)) {
                        return card.components.every(comp => comp?.data?.title !== "我的应用");
                    }
                    return true;
                });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        console.log("HUPU_remove_ads error: " + e);
    }
}

$done({ body });