Snow.template = function (html, data, callback, nocache) {
    //load template from url
    if (callback) {
        var url = html;
        var temp, key = 'template-' + url;
        if (!nocache) {
            temp = localStorage.getItem(key);
        }
        if (temp) {
            callback(template(temp, data));
            return;
        }
        $.ajax({
            url: SnowSaas.ServicePath.getPageTemplate(page),
            type: 'GET',
            contentType: "text/html; charset=utf-8",
            dataType: 'html',
            error: function (e) {
                if (e.status > 0) {
                    console.log('Network exception: ' + e.statusText);
                }
            },
            success: function (ret) {
                //cache the template
                if (!nocache) {
                    localStorage.setItem(key, ret);
                }
                callback(template(ret, data));
            }
        });
    }
    else {
        return template(html, data);
    }
    function template(html, data) {
        var re = /<%([\s\S]*?)%>/g,///<%(.+?)%>/g, ///<%[\s\S]*?%>/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|console|debugger|{|}|;))(.*)?/g,
            code = 'with(data) { var r=[];\n',
            cursor = 0,
            result;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
        try { result = new Function('data', code).apply(data, [data]); }
        catch (err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
        return result;
    }
}
