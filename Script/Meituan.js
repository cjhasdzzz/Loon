/**
 * 美团 App 净化脚本（Loon Script v2）
 * 触发类型：http-response，需在插件中配置 requires-body=true
 */

const mtUrl = (typeof $request !== "undefined" && $request && $request.url) || "";
const mtHideTabs = ["video", "xiaotuan"];
const mtKeepTabs = ["homepage", "mine"];
const mtFeedScenes = ["gwc_feed1_2265", "personalcenter_2154"];
const mtMineHide = ["mine_cross_recommend"];
const mtSearchHide = ["EntranceHotwordsV2Hotwords", "EntranceHotwordsV2ContentCard"];
const mtKeepTabNames = ["首页", "神券", "我的"];

function isObj(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function handleTab(obj) {
  const res = obj && obj.data && obj.data.resource;
  if (!isObj(res) || !Array.isArray(res.tabArea)) return false;
  const names = res.tabArea.map(t => (isObj(t) ? t.tabName : ""));
  if (!mtKeepTabs.every(n => names.includes(n))) return false;
  const kept = res.tabArea.filter(t => !(isObj(t) && mtHideTabs.includes(t.tabName)));
  if (kept.length === res.tabArea.length) return false;
  res.tabArea = kept;
  return true;
}

function handleFeed(obj) {
  const m = mtUrl.match(/\/lycoris\/scene\/([A-Za-z0-9_]+)/);
  if (!m || !mtFeedScenes.includes(m[1])) return false;
  if (!isObj(obj) || !Array.isArray(obj.data)) return false;
  obj.data = [];
  obj.bottom = true;
  if (!isObj(obj.ext)) obj.ext = {};
  obj.ext.forbidByExp = true;
  return true;
}

function handleMine(obj) {
  if (!isObj(obj) || !Array.isArray(obj.children)) return false;
  const kept = obj.children.filter(c => !(isObj(c) && mtMineHide.includes(c.name)));
  if (kept.length === obj.children.length) return false;
  obj.children = kept;
  return true;
}

function handleDefaultWord(obj) {
  const res = obj && obj.searchIntroduceResponse;
  if (!isObj(res)) return false;
  let changed = false;
  const dw = res.defaultWordRes;
  if (isObj(dw) && Array.isArray(dw.defaultWordItems) && dw.defaultWordItems.length) {
    dw.defaultWordItems = [];
    changed = true;
  }
  if (Array.isArray(res.HotWordInfos) && res.HotWordInfos.length) {
    res.HotWordInfos = [];
    changed = true;
  }
  return changed;
}

function handleHotRecommend(obj) {
  const d = obj && obj.data;
  if (!isObj(d) || !Array.isArray(d.segmentsV2)) return false;
  let changed = false;
  const kept = [];
  d.segmentsV2.forEach(s => {
    if (!isObj(s) || !Array.isArray(s.hotwordSegments)) {
      kept.push(s);
      return;
    }
    const hs = s.hotwordSegments.filter(h => !(isObj(h) && mtSearchHide.includes(h.pageName)));
    if (hs.length === s.hotwordSegments.length) {
      kept.push(s);
      return;
    }
    changed = true;
    if (hs.length) {
      s.hotwordSegments = hs;
      kept.push(s);
    }
  });
  if (changed) d.segmentsV2 = kept;
  const b = d.aiSearchBubble;
  if (isObj(b) && Array.isArray(b.bubbleTexts) && b.bubbleTexts.length) {
    b.bubbleTexts = [];
    changed = true;
  }
  return changed;
}

function handleAiSkill(obj) {
  if (!isObj(obj) || typeof obj.data !== "string") return false;
  const d = JSON.parse(obj.data);
  if (!isObj(d) || !isObj(d.skills) || !Object.keys(d.skills).length) return false;
  d.skills = {};
  obj.data = JSON.stringify(d);
  return true;
}

function clearArea(root, key) {
  const holders = [root, root && root.data];
  let changed = false;
  holders.forEach(h => {
    if (!isObj(h)) return;
    [h.resourcesMap, h.resource].forEach(r => {
      if (isObj(r) && Array.isArray(r[key]) && r[key].length) {
        r[key] = [];
        changed = true;
      }
    });
  });
  return changed;
}

// 兼容原代码末尾的第二段逻辑（保留「首页/神券/我的」、移除 oneCentBuy）
function handleExtraData(obj) {
  if (!isObj(obj) || !obj.data) return false;
  if (Array.isArray(obj.data)) {
    const kept = obj.data.filter(item => isObj(item) && item.name && mtKeepTabNames.includes(item.name));
    if (kept.length === obj.data.length) return false;
    obj.data = kept;
    return true;
  }
  if (isObj(obj.data) && Object.prototype.hasOwnProperty.call(obj.data, "oneCentBuy")) {
    delete obj.data.oneCentBuy;
    return true;
  }
  return false;
}

(() => {
  const body = typeof $response !== "undefined" && $response ? $response.body : "";
  if (typeof body !== "string" || !body) {
    $done({});
    return;
  }

  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    console.log(`[美团净化] JSON 解析失败: ${e}`);
    $done({});
    return;
  }

  let changed = false;
  try {
    if (/\/aggroup\/indexTab/.test(mtUrl)) {
      changed = handleTab(obj);
    } else if (/\/lycoris\/scene\//.test(mtUrl)) {
      changed = handleFeed(obj);
    } else if (/\/usercenter\/display/.test(mtUrl)) {
      changed = handleMine(obj);
    } else if (/\/searchpage\/defaultword/.test(mtUrl)) {
      changed = handleDefaultWord(obj);
    } else if (/\/searchpage\/hotword\/city\/divide\/hotrecommend\//.test(mtUrl)) {
      changed = handleHotRecommend(obj);
    } else if (/\/assistant\/getAppClientHornConfig/.test(mtUrl)) {
      changed = handleAiSkill(obj);
    } else if (/\/mop\/entry\/shoppingCartEntry/.test(mtUrl)) {
      changed = clearArea(obj, "topBannerArea");
    } else if (/\/entryModule\/startupPicture/.test(mtUrl)) {
      changed = clearArea(obj, "startupPicArea");
    } else {
      changed = handleExtraData(obj);
    }
  } catch (e) {
    console.log(`[美团净化] 处理响应出错: ${e}`);
    changed = false;
  }

  $done(changed ? { body: JSON.stringify(obj) } : {});
})();
