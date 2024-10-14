export default class Print {
  counter = 0;
  modes = { iframe: "iframe", popup: "popup" };
  standards = { strict: "strict", loose: "loose", html5: "html5" };
  linkName = '';
  defaults = {    // 默认配置
    mode: this.modes.iframe,
    standard: this.standards.html5,
    popHt: 500,
    popWd: 400,
    popX: 200,
    popY: 200,
    popTitle: '',
    popClose: false,
    extraCss: '',
    extraHead: '',
    retainAttr: ["id", "class", "style"]
  }

  settings = {};// global settings

  constructor (element, linkName, options) {
    this.settings = Object.assign(this.settings, this.defaults, options);
    this.linkName = linkName;

    this.counter++;
    let idPrefix = "printArea_";
    let _element = document.querySelector("[id^=" + idPrefix + "]"); // 获取到指定元素
    if (_element) _element.offsetParent.removeChild(_element); // 删除内容

    this.settings.id = idPrefix + this.counter;

    let printSource = [element]; // 传入的元素  

    let PrintAreaWindow = this.PrintArea.getPrintWindow(); // 创建窗口

    this.PrintArea.write(PrintAreaWindow.doc, printSource); // 写入内容

    setTimeout(() => {
      this.PrintArea.print(PrintAreaWindow) // 打开打印
    }, 1000);
  }

  PrintArea = {
    print: (PAWindow) => {
      let paWindow = PAWindow.win;

      // if (PAWindow.doc.attachEvent){ 
      //     PAWindow.doc.attachEvent("onload", function(){ 
      //         alert("Local iframe is now loaded."); 
      //     }); 
      // } else { 
      // PAWindow.doc.onload = ()=>{
      paWindow.focus();
      paWindow.print();
      if (this.settings.mode == this.modes.popup && this.settings.popClose) {
        setTimeout(() => {
          paWindow.close()
        }, 2000)
      }
      // }
      // } 
    },
    write: (PADocument, ele) => {
      PADocument.open();
      PADocument.write(this.PrintArea.docType() + "<html>" + this.PrintArea.getHead() + this.PrintArea.getBody(ele) + "</html>");
      PADocument.close();
    },
    docType: () => {  // 获取doctype
      if (this.settings.mode == this.modes.iframe) return "";
      if (this.settings.standard == this.standards.html5) return "<!DOCTYPE html>";

      let transitional = this.settings.standard == this.standards.loose ? " Transitional" : "";
      let dtd = this.settings.standard == this.standards.loose ? "loose" : "strict";

      return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01' + transitional + '//EN" "http://www.w3.org/TR/html4/' + dtd + '.dtd">';
    },
    getHead: () => { // 获取head
      let extraHead = "";
      let links = "";

      if (this.settings.extraHead) {
        this.settings.extraHead.replace(/([^,]+)/g, (m) => {
          extraHead += m;
        })
      }

      if (this.linkName === '') {
        let linkNodeArr = document.querySelectorAll('link'); // 获取link标签 节点
        let linkArr = [];   // link数组
        for (let i = 0; i < linkNodeArr.length; i++) {
          linkArr.push(linkNodeArr[i])
        }
        linkArr.filter((item, index) => {
          let relAttr = item.getAttribute('rel');
          return relAttr && relAttr.toLowerCase() == 'stylesheet';
        })
          .filter((item, index) => {
            let mediaAttr = item.getAttribute('media');
            return !mediaAttr || mediaAttr.toLowerCase() == 'print' || mediaAttr.toLowerCase() == 'all'
          })
          .forEach((item) => {
            links += '<link type="text/css" rel="stylesheet" href="' + item.getAttribute('href') + '" >';
          })

        if (this.settings.extraCss) {
          this.settings.extraCss.replace(/([^,\s]+)/g, (m) => {
            links += '<link type="text/css" rel="stylesheet" href="' + m + '">'
          });
        }
      } else {
        links = '<link type="text/css" rel="stylesheet" href="' + this.linkName + '">';
      }

      // let styleNodeArr = document.querySelectorAll('style');  // 获取style标签 节点
      // let styleArr = []; // style数组
      // let styles = '';
      // for (let i = 0; i < styleNodeArr.length; i++) {
      //   styleArr.push(styleNodeArr[i])
      // }
      // styleArr.forEach((item) => {
      //   // console.dir(item)
      //   styles += item.outerHTML;
      // })

      // return "<head><title>" + this.settings.popTitle + "</title>" + extraHead + links + styles + "</head>";
      return "<head><title>" + this.settings.popTitle + "</title>" + extraHead + links + "</head>";
    },
    getBody: (elements) => {  // 获取body
      let htm = "";
      let attrs = this.settings.retainAttr;
      elements.forEach((item) => {
        // let ele = this.PrintArea.getFormData(item);
        let ele = item;
        let attributes = "";
        for (let x = 0; x < attrs.length; x++) {
          let eleAttr = ele.getAttribute(attrs[x]);
          if (eleAttr) {
            attributes += (attributes.length > 0 ? " " : "") + attrs[x] + "='" + eleAttr + "'";
          }
        }
        htm += '<div ' + attributes + '>' + ele.innerHTML + '</div>';
      });
      return "<body>" + htm + "</body>";
    },
    // getFormData: (ele)=>{   //获取表单元素
    //         var copy = ele.clone();
    //         var copiedInputs = $("input,select,textarea", copy);
    //         $("input,select,textarea", ele).each(function( i ){
    //             var typeInput = $(this).attr("type");
    //             if ($.type(typeInput) === 'undefined') typeInput = $(this).is("select") ? "select" : $(this).is("textarea") ? "textarea" : "";
    //             var copiedInput = copiedInputs.eq( i );

    //             if ( typeInput == "radio" || typeInput == "checkbox" ) copiedInput.attr( "checked", $(this).is(":checked") );
    //             else if ( typeInput == "text" || typeInput == "" ) copiedInput.attr( "value", $(this).val() );
    //             else if ( typeInput == "select" )
    //                 $(this).find( "option" ).each( function( i ) {
    //                     if ( $(this).is(":selected") ) $("option", copiedInput).eq( i ).attr( "selected", true );
    //                 });
    //             else if ( typeInput == "textarea" ) copiedInput.text( $(this).val() );
    //         });
    //         return copy;
    // },
    getPrintWindow: () => { // 创建窗口
      let PrintArea = this.PrintArea;
      switch (this.settings.mode) {
        case this.modes.iframe:
          let f = new PrintArea.Iframe();
          return { win: f.contentWindow || f, doc: f.doc };
        case this.modes.popup:
          let p = new PrintArea.Popup();
          return { win: p, doc: p.doc };
      }
    },
    Iframe: () => {
      let frameId = this.settings.id;
      let iframeStyle = 'border:0;position:absolute;width:0px;height:0px;right:0px;top:0px;';
      let iframe;

      try {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        iframe.setAttribute('id', frameId)
        iframe.setAttribute('style', iframeStyle)
        iframe.setAttribute('src', "#" + new Date().getTime())

        iframe.doc = null;
        iframe.doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : iframe.document);
      } catch (e) {
        // throw e + ". iframes may not be supported in this browser.";
      }

      // if (iframe.doc == null) throw "Cannot find document.";

      return iframe;
    },
    Popup: () => {
      let windowAttr = "location=yes,statusbar=no,directories=no,menubar=no,titlebar=no,toolbar=no,dependent=no";
      windowAttr += ",width=" + this.settings.popWd + ",height=" + this.settings.popHt;
      windowAttr += ",resizable=yes,screenX=" + this.settings.popX + ",screenY=" + this.settings.popY + ",personalbar=no,scrollbars=yes";

      let newWin = window.open("", "_blank", windowAttr);

      newWin.doc = newWin.document;

      return newWin;
    }
  };
}
