/**
 * 扫描全能王响应处理脚本
 */
const url = (typeof $request !== "undefined" && ($request.url || ($request.request && $request.request.url))) || "";
const rawBody = (typeof $response !== "undefined" && $response.body) || "";

if (!rawBody) {
  $done({});
}

const VIPA = "/purchase/cs/query_property";
const VIPB = "/queryProperty";
const TQZX = "/getPrivilegeItem";

const VIP_DATA = {
  group1_paid: 1,
  ms_first_pay: 0,
  vip_type: "svip",
  auto_renewal: true,
  in_trial: 1,
  members_page: 0,
  pc_vip: 1,
  renew_type: "year",
  renew_method: "appstore",
  ys_first_pay: 0,
  initial_tm: "4092599349",
  product_id: "com.intsig.camscanner.premiums.oneyear.autorenewable.free.test1",
  vip_level_info: {
    score: 0,
    level: 0,
    next_score: 1,
    start_score: 0,
    create_time: 0
  },
  nxt_renew_tm: "4092599349",
  last_payment_method: "appstore",
  grade: 2,
  svip: 1,
  expiry: 4092599349,
  pending: 0,
  level_info: {
    level: 1,
    end_days: 30,
    days: 1
  },
  inherited_flag: 0,
  group2_paid: 0
};

const PRIVILEGE_ITEMS = {
  document: [
    { balance: -1, item: "CamScanner_Pic2pdf" },
    { balance: -1, item: "CamScanner_PdfCompress" },
    { balance: -1, item: "CamScanner_PdfEncrypt" },
    { balance: -1, item: "CamScanner_FileMerge" },
    { balance: -1, item: "CamScanner_PdfExtract" },
    { balance: -1, item: "CamScanner_PdfWatermark" },
    { balance: -1, item: "CamScanner_PdfSign" },
    { balance: 99999, item: "CamScanner_Intellect_Erase" }
  ],
  transfer: [
    { balance: -1, item: "CamScanner_ExcelRecoginze" },
    { balance: -1, item: "CamScanner_RoadMap" },
    { balance: -1, item: "CamScanner_Pdf2ppt" },
    { balance: 99999, item: "CamScanner_CloudOCR" }
  ],
  other: [
    { balance: 99999, item: "CamScanner_Translation" },
    { balance: -1, item: "CamScanner_DirNum" },
    { balance: -1, item: "CamScanner_IP_REMOVEAD" },
    { balance: -1, item: "CamScanner_PingTu" },
    { balance: 99999, item: "CamScanner_Points" },
    { balance: 99999, item: "CamScanner_Fax_Balance" }
  ],
  scaner: [
    { balance: 99999, item: "CamScanner_ImageRestore" },
    { balance: -1, item: "CamScanner_Patting" },
    { balance: 99999, item: "CamScanner_Profile_Card_Format" },
    { balance: -1, item: "CamScanner_BookMode" },
    { balance: -1, item: "CamScanner_CertMode" },
    { balance: -1, item: "CamScanner_HDScan" },
    { balance: 99999, item: "CamScanner_CloudOCR" }
  ],
  pure: [
    { balance: -1, item: "CamScanner_IP_REMOVEAD" }
  ]
};

try {
  const payload = JSON.parse(rawBody);

  if (payload && typeof payload === "object" && payload.data && typeof payload.data === "object") {
    if (url.includes(VIPA)) {
      payload.data.psnl_vip_property = VIP_DATA;
      payload.data.fax_balance = "99999";
      payload.data.used_points = "99999";
      payload.data.points = "99999";
      payload.data.pdfword_balance = "100010";
      payload.data.bookmode_balance = 100010;
      payload.data.immt_expy_points = "99999";
      payload.data.ocr_balance = 99999;
      payload.data.login_ocr_balance = 99999;
      payload.data.no_login_ocr_balance = "99999";
      payload.data.CamScanner_RoadMap = 100000;
      payload.data.CamScanner_RoadMap_Excel = 100000;
    }

    if (url.includes(VIPB) && payload.data.ar_property && typeof payload.data.ar_property === "object") {
      payload.data.ar_property.psnl_vip_property = VIP_DATA;
    }

    if (url.includes(TQZX)) {
      payload.data.data = PRIVILEGE_ITEMS;
    }
  }

  $done({ body: JSON.stringify(payload) });
} catch (err) {
  $done({ body: rawBody });
}
