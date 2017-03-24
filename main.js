var config = {
  imageWidth: 600,
  imageHeight: 400,

  fonts: {
    arial: { family: 'Arial', style: ['normal', 'bold'] },
    calibri: { family: 'Calibri', style: ['normal', 'bold'] },
    candara: { family: 'Candara', style: ['normal', 'bold'] },
    myriadpro: { family: 'Myriad Pro', style: ['normal', 'bold'] },
    myriadprocondensed: { family: 'Myriad Pro Condensed', style: ['normal', 'bold'] },
    opensans: { family: 'Open Sans', style: ['normal', 'bold'] },
    opensanscondensed: { family: 'Open Sans Condensed', style: ['normal', 'bold'] },
    ptsans: { family: 'PT Sans', style: ['normal', 'bold'] },
    ptsansnarrow: { family: 'PT Sans Narrow', style: ['normal', 'bold'] },
    tahoma: { family: 'Tahoma', style: ['normal', 'bold'] },
    timesnewroman: { family: 'Times New Roman', style: ['normal', 'bold'] },
    ubuntu: { family: 'Ubuntu', style: ['normal', 'bold'] },
    verdana: { family: 'Verdana', style: ['normal', 'bold'] },
  },
  fontSizes: [10, 11, 12, 14, 16, 18, 20, 22, 24, 30, 36, 48, 60, 72, 96],
};

(function() {

// Event handlers
function _onFontFaceChanged(e) {
  if (this.activeObject && this.activeObject.type == 'text') {
    this.activeObject.setFontFamily($(e.currentTarget).val());
    this.activeCanvas.renderAll();
  }
}

function _onFontSizeChanged(e) {
  if (this.activeObject && this.activeObject.type == 'text') {
    this.activeObject.setFontSize(parseInt($(e.currentTarget).val(), 10));
    this.activeCanvas.renderAll();
  }
}

function _onFontColorChanged(e) {
  if (this.activeObject) {
    this.activeObject.setFill(e.color.toString('rgb'));
    this.activeCanvas.renderAll();
  }
}

function _onBoldChanged() {
  if (this.activeObject && this.activeObject.type == 'text') {
    this.activeObject.setFontWeight(!this.widgets.bold.hasClass('active')? 700 : 400);
    this.activeCanvas.renderAll();
  }
}

function _onCenterHClicked(e) {
  var self = this;
  if (this.activeObject) {
    /* this.activeCanvas.fxCenterObjectH(this.activeObject, {
      onComplete: function() {
        self.widgets.centerh.blur();
        self.widgets.centerh.tooltip('hide');
        _doTextAutoupdate.call(self);
      }
    }); */
    //this.activeCanvas.centerObjectH(this.activeObject);
    this.activeObject.setLeft( (this.activeCanvas.origWidth - this.activeObject.getWidth())/2 );
    this.activeObject.setCoords();
    this.activeCanvas.renderAll();
  }
}

function _onCenterVClicked(e) {
  var self = this;
  if (this.activeObject) {
    /* this.activeCanvas.fxCenterObjectV(this.activeObject, {
      onComplete: function() {
        self.widgets.centerv.blur();
        self.widgets.centerv.tooltip('hide');
        _doTextAutoupdate.call(self);
      }
    }); */
    //this.activeCanvas.centerObjectV(this.activeObject);
    this.activeObject.setTop( (this.activeCanvas.origHeight - this.activeObject.getHeight())/2 );
    this.activeObject.setCoords();
    this.activeCanvas.renderAll();
  }
}

function _onRemoveClicked(e) {
  var self = this;
  if (this.activeObject) {
    this.activeCanvas.fxRemove(this.activeObject, {
      onComplete: function() {
        self.widgets.remove.blur();
        self.widgets.remove.tooltip('hide');
        _doTextAutoupdate.call(self);
      }
    });
  }
}

function _clearedCanvas() {
  //console.log('unselect');
  this.activeObject = null;

  this.widgets.textedit.val('').prop('disabled', true);
  this.widgets.font_face.select2('val', '').prop('disabled', true);
  this.widgets.font_size.select2('val', '').prop('disabled', true);
  this.widgets.font_color.colorpicker('setValue', '#000000').prop('disabled', true);
  this.widgets.bold.removeClass('active').prop('disabled', true);
  this.widgets.remove.prop('disabled', true);
}

function _onCanvasActivate(options) {
  //console.log('activate', options);

  var canvasEl = null, panelEl = null, target = null;
  if (options.e) {  // Fabric event
    canvasEl = options.e.target;
    panelEl = this.getCanvasElementPanel(canvasEl);
    if (options.target)
      target = options.target;
  } else {          // Browser event
    panelEl = options.currentTarget;
    canvasEl = $('canvas.upper-canvas', panelEl)[0];
  }

  if (this.activeCanvas != null && canvasEl != null) {
    if (this.activeCanvas == canvasEl.fabric) {
      return;
    }

    this.activeCanvas.deactivateAllWithDispatch();
    this.activeCanvas.renderAll();
    if (options.e && target) {
      _onCanvasObjectSelected.call(this, options);
    }

    $(this.getCanvasElementPanel(this.activeCanvas.getElement())).removeClass('active');
  }

  $(panelEl).addClass('active');
  this.activeCanvas = canvasEl.fabric;

  this.updateWidgets();
}

function _onCanvasObjectSelected(e) {
  //console.log('select', e);
  this.activeObject = e.target;

  if (e.target.type == 'text') {
    this.widgets.textedit.val(e.target.text).prop('disabled', false);
    this.widgets.font_face.val(e.target.fontFamily).prop('disabled', false);
    this.widgets.font_size.val(e.target.fontSize).prop('disabled', false);
    ///this.widgets.font_color.colorpicker('setValue', e.target.fill).prop('disabled', false);
    if (e.target.fontWeight == 700) {
      this.widgets.bold.addClass('active').prop('disabled', false);
    } else {
      this.widgets.bold.removeClass('active').prop('disabled', false);
    }
    this.widgets.remove.prop('disabled', false);
  } else {
    _clearedCanvas.call(this);
  }
}

ImageEditor = function() {
  this.init.apply(this, arguments);
}

$.extend(ImageEditor.prototype, {
  activeCanvas: null,
  activeObject: null,
  data: null,

  textDefaults: {
    textAlign: 'center',
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasRotatingPoint: false,
    hasControls: false
  },

  init: function(scenarioEditor, containerElement) {
    this.container = containerElement;
    var self = this;

    // Populate widgets dict with all fields and buttons
    this.widgets = {
    };
    $('input[type!=hidden], textarea, select, button', this.container).each(function(i) {
      if (this.name)
        self.widgets[this.name] = $(this);
      if (this.id)
        self.widgets[this.id] = $(this);
    });
    //console.log(this.widgets);

    // Initialize canvas
    this.imageCanvas = this.initCanvas($('.imagepanel canvas', this.container)[0], 'image', config.imageWidth, config.imageHeight);
    this.activeCanvas = this.imageCanvas;

    /*
    var panelEl = this.getCanvasElementPanel(this.imageCanvas.lowerCanvasEl);
    $(panelEl).addClass('active');
    this.activeCanvas = this.imageCanvas;
    this.activeObject = null;
    */

    // Form events
    this.widgets.save.click(this.save.bind(this));
    this.widgets.add_text.click(this.addText.bind(this));

    // Populate text edit widgets
    var fontFaceOptions = '';
    for (var i in config.fonts) {
      fontFaceOptions += '<option>'+config.fonts[i].family+'</option>';
    }
    this.widgets.font_face.html(fontFaceOptions);

    var fontSizeOptions = '';
    for (var i in config.fontSizes) {
      fontSizeOptions += '<option>'+config.fontSizes[i]+'</option>';
    }
    this.widgets.font_size.html(fontSizeOptions);

    // Text edit events
    this.widgets.textedit.bind('change keyup paste', this.textEditChanged.bind(this));
    this.widgets.font_size.select2().change(_onFontSizeChanged.bind(this));
    this.widgets.font_face.select2({
      formatSelection: function (state) {
        return '<span class="glyphicon glyphicon-font"/>'
      }
    }).change(_onFontFaceChanged.bind(this));
    $('.select2-container', this.container).tooltip();

    /*
    this.widgets.font_color.colorpicker().tooltip()
                           .click(function() { $(this).colorpicker('show') })
                           .on('changeColor', _onFontColorChanged.bind(this));
                           */

    this.widgets.bold.on('click', _onBoldChanged.bind(this));

    this.widgets.centerh.click(_onCenterHClicked.bind(this));
    this.widgets.centerv.click(_onCenterVClicked.bind(this));

    this.widgets.remove.click(_onRemoveClicked.bind(this));

    $('button[name=remove]', this.container).tooltip();
    this.widgets.background_image.change(this.backgroundImageChanged.bind(this));
  },

  initCanvas: function(el, canvasName, origWidth, origHeight) {
    var canvas = new fabric.Canvas(el);

    // Canvas events
    $(this.getCanvasElementPanel(canvas.getElement())).click(_onCanvasActivate.bind(this));
    canvas.on('mouse:down', _onCanvasActivate.bind(this));
    canvas.on('object:selected', _onCanvasObjectSelected.bind(this));
    canvas.on('selection:cleared', _clearedCanvas.bind(this));
    //initAligningGuidelines(canvas);
    //initCenteringGuidelines(canvas);

    // Set some default params
    canvas.name = canvasName;
    canvas.origWidth = origWidth;
    canvas.origHeight = origHeight;
    canvas.setBackgroundColor('rgba(255, 255, 255, 1.0)', canvas.renderAll.bind(canvas));
    el.fabric = canvas;
    canvas.upperCanvasEl.fabric = canvas;

    return canvas;
  },

  updateWidgets: function() {
    console.trace();
  },

  save: function() {
    console.log('save');
  },

  getCanvasElementPanel: function(el) {
    return $(el).parents('.panel')[0];
  },

  resizeAllCanvas: function() {
    for (var i in this.allCanvas) {
      this.resizeCanvas(this.allCanvas[i]);
    }
  },

  resizeCanvas: function(canvas) {
    var size = this.getCanvasElementPanel(canvas.getElement()).getBoundingClientRect();
    canvas.setWidth(size.width - 32);
    canvas.setHeight(size.height - 32);

    canvas.setZoom(canvas.getWidth() / canvas.origWidth);

    // FIXME: race condition "canvas.backgroundImage is null"
    //if (canvas.backgroundImage)
    //  canvas.backgroundImage.set('width', canvas.width).set('height', canvas.height).setCoords();
    canvas.renderAll();
  },


  addText: function() {
    if (!this.activeCanvas)
      return;

    var defaults = {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#000000',
    };

    var text = new fabric.Text('текст', $.extend(defaults, this.textDefaults));
    this.activeCanvas.add(text);
    this.activeCanvas.setActiveObject(text);
    this.widgets.textedit.focus();
    _doTextAutoupdate.call(this);
  },

  textEditChanged: function(e) {
    if (!this.activeObject)
      return;

    this.activeObject.text = this.widgets.textedit.val();
    this.activeObject.setCoords();
    this.activeCanvas.renderAll();
  },

  backgroundImageChanged: function(e) {
    if (this.widgets.background_image[0].files.length == 0)
      return;

    // FIXME: check file type

    var fr = new FileReader();
    fr.onload = this.backgroundImageLoaded.bind(this);
    fr.readAsDataURL(this.widgets.background_image[0].files[0]);
  },

  backgroundImageLoaded: function(e) {
    var dataUrl = e.target.result,
        canvas = this.activeCanvas;
    canvas.setBackgroundImage(dataUrl, canvas.renderAll.bind(canvas), {
      width: canvas.origWidth,
      height: canvas.origHeight
    });
  }
});

})();
