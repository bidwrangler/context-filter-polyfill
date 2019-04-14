(function () {
  'use strict';

  // available filters
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter#Values
  var AvailableFilter;
  (function (AvailableFilter) {
      AvailableFilter["None"] = "none";
      AvailableFilter["Url"] = "url";
      AvailableFilter["Blur"] = "blur";
      AvailableFilter["Brightness"] = "brightness";
      AvailableFilter["Contrast"] = "contrast";
      AvailableFilter["DropShadow"] = "drop-shadow";
      AvailableFilter["Grayscale"] = "grayscale";
      AvailableFilter["HueRotate"] = "hue-rotate";
      AvailableFilter["Invert"] = "invert";
      AvailableFilter["Opacity"] = "opacity";
      AvailableFilter["Saturate"] = "saturate";
      AvailableFilter["Sepia"] = "sepia";
  })(AvailableFilter || (AvailableFilter = {}));

  // stores all implemented filters, see
  // available filters for reference
  const SUPPORTED_FILTERS = new Map();

  // detects feature availability
  const supportsContextFilters = () => 'filter' in CanvasRenderingContext2D.prototype;
  // creates an offscreen context matching the origin
  const createOffscreenContext = (original) => {
      // prepare a non-patched canvas
      const canvas = document.createElement('canvas');
      canvas.height = original.canvas.height;
      canvas.width = original.canvas.width;
      // we won't patch the mirror as it will lead to a loop
      Object.defineProperty(canvas, '__skipFilterPatch', { value: true });
      // get context
      return canvas.getContext('2d');
  };

  // add filter property
  // apply property patches
  function applyPropertyPatches() {
      Object.defineProperty(HTMLCanvasElement.prototype, '__skipFilterPatch', { writable: true, value: false });
      Object.defineProperty(HTMLCanvasElement.prototype, '__currentPathMirror', { writable: true, value: undefined });
      Object.defineProperty(CanvasRenderingContext2D.prototype, 'filter', { writable: true, value: AvailableFilter.None });
  }

  const PROTECTED_KEYS = [
      '__skipFilterPatch',
      '__currentPathMirror',
      'canvas',
      'filter',
      'getImageData'
  ];

  function applySetterPatches() {
      // we monkey-patch all context members to
      // apply everything to the current mirror
      const descriptors = Object.getOwnPropertyDescriptors(CanvasRenderingContext2D.prototype);
      Object
          .keys(descriptors)
          // do not overload these
          .filter(member => !PROTECTED_KEYS.includes(member))
          // get setters only
          .filter(member => descriptors[member].set)
          // apply monkey-patch to pass through
          .forEach(member => {
          const descriptor = descriptors[member];
          // overload setter
          const original = descriptor;
          Object.defineProperty(CanvasRenderingContext2D.prototype, member, {
              get: function () {
                  if (this.canvas.__skipFilterPatch) {
                      return original.get.call(this);
                  }
                  // read from mirror
                  return this.canvas.__currentPathMirror[member];
              },
              set: function (value) {
                  // do not apply on mirror
                  if (this.canvas.__skipFilterPatch) {
                      return original.set.call(this, value);
                  }
                  // prepare mirror context if missing
                  if (!this.canvas.__currentPathMirror) {
                      this.canvas.__currentPathMirror = createOffscreenContext(this);
                  }
                  // apply to mirror
                  this.canvas.__currentPathMirror[member] = value;
              }
          });
      });
  }

  // all functions that somehow force the canvas to
  // actually draw something which should adopt the
  // given filters
  // TODO: what about clipping?
  const DRAWING_FUNCTIONS = [
      'clearRect',
      // 'clip',
      'drawImage',
      'fill',
      'fillRect',
      'fillText',
      'stroke',
      'strokeRect',
      'strokeText'
  ];

  // applies the given filter to the provided canvas 2d context
  const applyFilter = (context, canvasFilters) => {
      // parse applied filters and call implementations
      canvasFilters
          // filters are separated by whitespace
          .split(' ')
          // filters may have options within appended brackets
          .map(filter => filter.match(/([-a-z]+)(?:\((.*)\))?/si).slice(1, 3))
          // apply all filters
          .reduce((input, [filter, options]) => {
          // do we have a appropriate filter implementation?
          if (SUPPORTED_FILTERS.has(filter)) {
              // then filter and return the result
              return SUPPORTED_FILTERS.get(filter)(input, options);
          }
          // nope, skip this
          return input;
      }, context);
  };
  // filter options are often represented as number-percentage,
  // means that they'll be percentages like `50%` or floating
  // in-between 0 and 1 like `.5`, so we normalize them.
  // https://developer.mozilla.org/en-US/docs/Web/CSS/filter#number-percentage
  const normalizeNumberPercentage = (percentage) => {
      let normalized = parseFloat(percentage);
      // check for percentages and divide by a hundred
      if (percentage.trimRight().endsWith('%')) {
          normalized /= 100;
      }
      return normalized;
  };
  // normalizes angles to a float between 0 and 1.
  // https://developer.mozilla.org/en-US/docs/Web/CSS/angle#Units
  const normalizeAngle = (angle) => {
      let normalized = parseFloat(angle);
      const unit = angle.slice(normalized.toString().length);
      // check for units and align accordingly
      switch (unit) {
          case 'deg':
              normalized /= 360;
              break;
          case 'grad':
              normalized /= 400;
              break;
          case 'rad':
              normalized /= 2 * Math.PI;
              break;
      }
      return normalized;
  };
  // TODO: we're assuming pixel based values for now only, so adopt to other lengths as well
  // https://developer.mozilla.org/en-US/docs/Web/CSS/length
  const normalizeLength = (length) => {
      return parseFloat(length);
  };

  function applyMethodPatches() {
      // we monkey-patch all context members to
      // apply everything to the current mirror
      const descriptors = Object.getOwnPropertyDescriptors(CanvasRenderingContext2D.prototype);
      Object
          .keys(descriptors)
          // do not overload these
          .filter(member => !PROTECTED_KEYS.includes(member))
          // get methods only
          .filter(member => descriptors[member].value && typeof descriptors[member].value === 'function')
          // apply monkey-patch to pass through
          .forEach(member => {
          const descriptor = descriptors[member];
          if (descriptor.value && typeof descriptor.value === 'function') {
              const original = descriptor.value;
              Object.defineProperty(CanvasRenderingContext2D.prototype, member, {
                  value: function (...args) {
                      // do not apply on mirror
                      if (this.canvas.__skipFilterPatch) {
                          return original.call(this, ...args);
                      }
                      // prepare mirror context if missing
                      if (!this.canvas.__currentPathMirror) {
                          this.canvas.__currentPathMirror = createOffscreenContext(this);
                      }
                      // apply to mirror
                      const result = this.canvas.__currentPathMirror[member](...args);
                      // draw functions may get filters applied and copied back to original
                      if (DRAWING_FUNCTIONS.includes(member)) {
                          // apply the filter
                          applyFilter(this.canvas.__currentPathMirror, this.filter);
                          // disable patch and reset transform temporary
                          this.canvas.__skipFilterPatch = true;
                          const originalTransform = this.getTransform();
                          this.setTransform(1, 0, 0, 1, 0, 0);
                          // draw mirror back
                          this.drawImage(this.canvas.__currentPathMirror.canvas, 0, 0);
                          // set back transforms and re-enable patch
                          this.setTransform(originalTransform);
                          this.canvas.__skipFilterPatch = false;
                          // reset the mirror for next draw cycle
                          this.canvas.__currentPathMirror = createOffscreenContext(this);
                      }
                      return result;
                  }
              });
          }
      });
  }

  const none = context => context;

  const blur = (context, radius = '0') => {
      let amount = normalizeLength(radius);
      // do not manipulate without proper amount
      if (amount <= 0) {
          return context;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      // http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js
      const wm = width - 1;
      const hm = height - 1;
      const rad1 = amount + 1;
      const mulTable = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];
      const mulSum = mulTable[amount];
      const shgTable = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];
      const shgSum = shgTable[amount];
      const r = [];
      const g = [];
      const b = [];
      const a = [];
      const vmin = [];
      const vmax = [];
      let iterations = 3; // 1 - 3
      let rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, pa;
      while (iterations-- > 0) {
          let yw = yi = 0;
          for (let y = 0; y < height; y++) {
              let rsum = data[yw] * rad1;
              let gsum = data[yw + 1] * rad1;
              let bsum = data[yw + 2] * rad1;
              let asum = data[yw + 3] * rad1;
              for (let i = 1; i <= amount; i++) {
                  p = yw + (((i > wm ? wm : i)) << 2);
                  rsum += data[p++];
                  gsum += data[p++];
                  bsum += data[p++];
                  asum += data[p];
              }
              for (x = 0; x < width; x++) {
                  r[yi] = rsum;
                  g[yi] = gsum;
                  b[yi] = bsum;
                  a[yi] = asum;
                  if (y == 0) {
                      vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
                      vmax[x] = ((p = x - amount) > 0 ? p << 2 : 0);
                  }
                  p1 = yw + vmin[x];
                  p2 = yw + vmax[x];
                  rsum += data[p1++] - data[p2++];
                  gsum += data[p1++] - data[p2++];
                  bsum += data[p1++] - data[p2++];
                  asum += data[p1] - data[p2];
                  yi++;
              }
              yw += (width << 2);
          }
          for (x = 0; x < width; x++) {
              yp = x;
              rsum = r[yp] * rad1;
              gsum = g[yp] * rad1;
              bsum = b[yp] * rad1;
              asum = a[yp] * rad1;
              for (i = 1; i <= amount; i++) {
                  yp += (i > hm ? 0 : width);
                  rsum += r[yp];
                  gsum += g[yp];
                  bsum += b[yp];
                  asum += a[yp];
              }
              yi = x << 2;
              for (y = 0; y < height; y++) {
                  data[yi + 3] = pa = (asum * mulSum) >>> shgSum;
                  if (pa > 0) {
                      pa = 255 / pa;
                      data[yi] = ((rsum * mulSum) >>> shgSum) * pa;
                      data[yi + 1] = ((gsum * mulSum) >>> shgSum) * pa;
                      data[yi + 2] = ((bsum * mulSum) >>> shgSum) * pa;
                  }
                  else {
                      data[yi] = data[yi + 1] = data[yi + 2] = 0;
                  }
                  if (x == 0) {
                      vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
                      vmax[y] = ((p = y - amount) > 0 ? p * width : 0);
                  }
                  p1 = x + vmin[y];
                  p2 = x + vmax[y];
                  rsum += r[p1] - r[p2];
                  gsum += g[p1] - g[p2];
                  bsum += b[p1] - b[p2];
                  asum += a[p1] - a[p2];
                  yi += width << 2;
              }
          }
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const brightness = (context, brightness = '1') => {
      let amount = normalizeNumberPercentage(brightness);
      // do not manipulate without proper amount
      if (amount === 1) {
          return context;
      }
      // align minimum
      if (amount < 0) {
          amount = 0;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      for (let i = 0; i < length; i += 4) {
          data[i + 0] *= amount;
          data[i + 1] *= amount;
          data[i + 2] *= amount;
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const contrast = (context, brightness = '1') => {
      let amount = normalizeNumberPercentage(brightness);
      // do not manipulate without proper amount
      if (amount === 1) {
          return context;
      }
      // align minimum
      if (amount < 0) {
          amount = 0;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      // https://gist.github.com/jonathantneal/2053866
      for (let i = 0; i < length; i += 4) {
          data[i + 0] = ((((data[i + 0] / 255) - .5) * amount) + .5) * 255;
          data[i + 1] = ((((data[i + 1] / 255) - .5) * amount) + .5) * 255;
          data[i + 2] = ((((data[i + 2] / 255) - .5) * amount) + .5) * 255;
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const grayscale = (context, grayscale = '0') => {
      let amount = normalizeNumberPercentage(grayscale);
      // do not manipulate without proper amount
      if (amount <= 0) {
          return context;
      }
      // a maximum of 100%
      if (amount > 1) {
          amount = 1;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      for (let i = 0; i < length; i += 4) {
          const luma = data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722;
          data[i + 0] += (luma - data[i + 0]) * amount;
          data[i + 1] += (luma - data[i + 1]) * amount;
          data[i + 2] += (luma - data[i + 2]) * amount;
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const hueRotate = (context, rotate = '0deg') => {
      let amount = normalizeAngle(rotate);
      // do not manipulate without proper amount
      if (amount <= 0) {
          return context;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      // https://github.com/makoConstruct/canvas-hue-rotate/blob/master/hueShiftCanvas.js
      const h = (amount % 1 + 1) % 1; // wraps the angle to unit interval, even when negative
      const th = h * 3;
      const thr = Math.floor(th);
      const d = th - thr;
      const b = 1 - d;
      let ma, mb, mc;
      let md, me, mf;
      let mg, mh, mi;
      switch (thr) {
          case 0:
              ma = b;
              mb = 0;
              mc = d;
              md = d;
              me = b;
              mf = 0;
              mg = 0;
              mh = d;
              mi = b;
              break;
          case 1:
              ma = 0;
              mb = d;
              mc = b;
              md = b;
              me = 0;
              mf = d;
              mg = d;
              mh = b;
              mi = 0;
              break;
          case 2:
              ma = d;
              mb = b;
              mc = 0;
              md = 0;
              me = d;
              mf = b;
              mg = b;
              mh = 0;
              mi = d;
              break;
      }
      //do the pixels
      let place = 0;
      for (let y = 0; y < height; ++y) {
          for (let x = 0; x < width; ++x) {
              place = 4 * (y * width + x);
              const ir = data[place + 0];
              const ig = data[place + 1];
              const ib = data[place + 2];
              data[place + 0] = Math.floor(ma * ir + mb * ig + mc * ib);
              data[place + 1] = Math.floor(md * ir + me * ig + mf * ib);
              data[place + 2] = Math.floor(mg * ir + mh * ig + mi * ib);
          }
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const invert = (context, invert = '0') => {
      let amount = normalizeNumberPercentage(invert);
      // do not manipulate without proper amount
      if (amount <= 0) {
          return context;
      }
      // a maximum of 100%
      if (amount > 1) {
          amount = 1;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      for (let i = 0; i < length; i += 4) {
          data[i + 0] = Math.abs(data[i + 0] - 255 * amount);
          data[i + 1] = Math.abs(data[i + 1] - 255 * amount);
          data[i + 2] = Math.abs(data[i + 2] - 255 * amount);
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const opacity = (context, opacity = '1') => {
      let amount = normalizeNumberPercentage(opacity);
      // do not manipulate without proper amount
      if (amount < 0) {
          return context;
      }
      // a maximum of 100%
      if (amount > 1) {
          amount = 1;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, the 4th entry is the alpha channel
      for (let i = 3; i < length; i += 4) {
          data[i] *= amount;
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const saturate = (context, saturation = '1') => {
      let amount = normalizeNumberPercentage(saturation);
      // do not manipulate without proper amount
      if (amount === 1) {
          return context;
      }
      // align minimum
      if (amount < 0) {
          amount = 0;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const lumR = (1 - amount) * .3086;
      const lumG = (1 - amount) * .6094;
      const lumB = (1 - amount) * .0820;
      const shiftW = width << 2;
      for (let j = 0; j < height; j++) {
          const offset = j * shiftW;
          for (let i = 0; i < width; i++) {
              const pos = offset + (i << 2);
              const r = data[pos + 0];
              const g = data[pos + 1];
              const b = data[pos + 2];
              data[pos + 0] = ((lumR + amount) * r) + (lumG * g) + (lumB * b);
              data[pos + 1] = (lumR * r) + ((lumG + amount) * g) + (lumB * b);
              data[pos + 2] = (lumR * r) + (lumG * g) + ((lumB + amount) * b);
          }
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  const sepia = (context, sepia = '0') => {
      let amount = normalizeNumberPercentage(sepia);
      // do not manipulate without proper amount
      if (amount <= 0) {
          return context;
      }
      // a maximum of 100%
      if (amount > 1) {
          amount = 1;
      }
      const { height, width } = context.canvas;
      const imageData = context.getImageData(0, 0, width, height);
      const { data } = imageData;
      const { length } = data;
      // in rgba world, every
      // n * 4 + 0 is red,
      // n * 4 + 1 green and
      // n * 4 + 2 is blue
      // the fourth can be skipped as it's the alpha channel
      // https://github.com/licson0729/CanvasEffects/blob/master/CanvasEffects.js#L464-L466
      for (let i = 0; i < length; i += 4) {
          const r = data[i + 0];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i + 0] = (0.393 * r + 0.769 * g + 0.189 * b) * amount + r * (1 - amount);
          data[i + 1] = (0.349 * r + 0.686 * g + 0.168 * b) * amount + g * (1 - amount);
          data[i + 2] = (0.272 * r + 0.534 * g + 0.131 * b) * amount + b * (1 - amount);
      }
      // set back image data to context
      context.putImageData(imageData, 0, 0);
      // return the context itself
      return context;
  };

  // add supported filters here by mapping the available
  // filter to the imported, implemented function
  SUPPORTED_FILTERS.set(AvailableFilter.None, none);
  SUPPORTED_FILTERS.set(AvailableFilter.Blur, blur);
  SUPPORTED_FILTERS.set(AvailableFilter.Brightness, brightness);
  SUPPORTED_FILTERS.set(AvailableFilter.Contrast, contrast);
  SUPPORTED_FILTERS.set(AvailableFilter.Grayscale, grayscale);
  SUPPORTED_FILTERS.set(AvailableFilter.HueRotate, hueRotate);
  SUPPORTED_FILTERS.set(AvailableFilter.Invert, invert);
  SUPPORTED_FILTERS.set(AvailableFilter.Opacity, opacity);
  SUPPORTED_FILTERS.set(AvailableFilter.Saturate, saturate);
  SUPPORTED_FILTERS.set(AvailableFilter.Sepia, sepia);
  // polyfill if the feature is not implemented
  if (!supportsContextFilters()) {
      // we monkey-patch all context members to
      // apply everything to the current mirror
      applyPropertyPatches();
      applySetterPatches();
      applyMethodPatches();
  }

}());
