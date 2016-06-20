Snow.Validate = {
    notNull: function (value) {
        if (value == '' || value == null || value == undefined)
            return false;
        return true;
    },
    int: function (value) {
        var reg = /^-?\d{0,10}$/;
        return reg.test(value);
    },
    float: function (value) {
        var reg = /^\d+(\.[\d]+)?$/;
        return reg.test(value);
    },
    email: function (value) {
        var reg = /^([a-zA-Z0-9_]|\-|\.)+@(([a-zA-Z0-9_]|\-)+\.)+[a-zA-Z]{2,4}$/;
        return reg.test(value);
    },
    multiEmail: function (value) {
        var temp = value.replace(/(\s*)/g, '').split(",");
        for (var index in temp) {
            var tempMail = temp[index];
            if (tempMail != "") {
                if (!myclass.email(tempMail)) {
                    return false;
                }
            }
        }
        return true;
    },
    phone: function (phoneNO) {
        if (phoneNO.length != 11) {
            return false;
        }
        var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;
        return reg.test(phoneNO);
    },
    price: function (value) {
        var reg = /^(([$])?((([0-9]{1,3},)+([0-9]{3},)*[0-9]{3})|[0-9]+)(\.[0-9]+)?)$/;
        return reg.test(value);
    },
    password: function (value) {
        var reg = /^[\S]{6,16}$/;
        return reg.test(value);
    },
    //0:broken 1:weak 2:middle 3:strong
    passwordStrong: function (pwd) {
        var level = 0;
        if (pwd != null && pwd != '') {
            var mode = 0;
            if (pwd.length <= 4)
                mode = 0;
            else {
                for (i = 0; i < pwd.length; i++) {
                    var charMode, charCode;
                    charCode = pwd.charCodeAt(i);
                    // 判断输入密码的类型
                    if (charCode >= 48 && charCode <= 57) //数字  
                        charMode = 1;
                    else if (charCode >= 65 && charCode <= 90) //大写  
                        charMode = 2;
                    else if (charCode >= 97 && charCode <= 122) //小写  
                        charMode = 4;
                    else
                        charMode = 8;
                    mode |= charMode;
                }
                level = 0;
                for (i = 0; i < 4; i++) {
                    if (mode & 1)
                        level++;
                    mode >>>= 1;
                }
            }
        }
        return level;
    },
    bankCard: function (no) {
        return /^[\d]{16,19}$/.test(no);
    }
};