export const Constants = {
    // url: 'https://www.goldenrosse.com/api/V1/admin/',
    url: 'https://goldenrose-api.nextazy.com/api/V1/',
    // baseUrl: 'https://www.goldenrosse.com/',
    //    baseUrl:'https://www.goldenrosse.com/',
    baseUrl: 'https://goldenrose-api.nextazy.com/',

    // auth
    login: 'login',
    forgotPassword: 'forgotpassword',
    resetPassword: 'resetpassword',
    changePassword: 'changepassword',
    verifyemail: 'emailVerify',
    getprofile: 'getprofile',

    // g2f
    getg2f: 'g2f/get',
    enableg2f: 'g2f/enable',
    disableg2f: 'g2f/disable',
    verifyg2f: 'g2f/verify',

    //User
    createuser: 'user/create',
    getAllUser: 'user/list',
    updateuser: 'user/update',
    getuserbyid: 'user/getdetails?id=',
    // getcarddetail:'user/cards?id=',

    //Coupon
    couponcreate: 'coupon/create',
    couponupdate: 'coupon/update',
    couponlist: 'coupon/list',
    deletecoupon: 'coupon/delete?id=',
    couponstatus: 'coupon/status?id=',
    // coupongetdetails: 'coupon/getdetails?id=',

    // Notifications
    sendnotification: 'notification/send',
    listnotification: 'notification/list',
    delnotification: 'notification/delete?id=',

    //Settings
    sitesetting: 'settings/update',
    getsetting: 'settings/get',
    adminactivity: 'activity',
    getlog: 'settings/getlog',
    deletelog: 'settings/deletelog?key=',
    deletealllog: 'settings/deletealllog',
    getenv: 'settings/getenv',
    updateenv: 'settings/updateenv',
    changeenv: 'settings/changeenv',
    restartserver: 'settings/restart',

    //Category
    addcategory: 'category/create',
    listcategory: 'category/list',
    enablecategory: 'category/status?id=',
    deletecategory: 'category/delete?id=',
    updatecategory: 'category/update',
    listallcategory: 'category/list/all',

    //product
    createproduct: 'product/create',
    updateproduct: 'product/update',
    productlist: 'product/list',
    enableproduct: 'product/status?id=',
    productdelete: 'product/delete?id=',
    importfile: 'product/import',
    deleteimage: 'product/remove/image',

    // Locale
    localecreate: 'locale/create',
    localeupdate: 'locale/update',
    localegetall: 'locale/getall',
    localedelete: 'locale/delete',
    localeaddkey: 'locale/addnewkey',
    localegetfile: 'locale/getFile?symbol=',
    localestatus: 'locale/status?id=',

    //Dashboard
    dashboard: 'dashboard',
    currentgraph: 'dashboard/graph',
    previousgraph: 'dashboard/graph/previous',
    statics: 'dashboard/statics',

    //Order
    changestatus: 'order/status',
    orderlist: 'order/list',
    orderbyid: 'order/details?id=',

    //ProductType
    typelist: 'type/list',
    typelistall: 'type/list/all',
    typecreate: 'type/create',
    typeupdate: 'type/update',
    typestaus: 'type/status?id=',
    typedelete: 'type/delete?id=',

    //Product subType
    subtypelist: 'subtype/list',
    subtypelistall: 'subtype/list/all',
    subtypecreate: 'subtype/create',
    subtypeupdate: 'subtype/update',
    subtypestaus: 'subtype/status?id=',
    subtypedelete: 'subtype/delete?id=',

    //order by status
    orderbystatus: 'order/list?order_status=',

    //user delete
    userdelete: 'user/deleteuser',

    //Product update
    productupdate: 'product/updatestock',
    commondiscount: 'settings/update/commondiscount'
}
