// popupLibrary — простая библиотека для создания всплывающих окон
// запуск: popupLibrary.init();

function disableScrolling() {
  let x = window.scrollX;
  let y = window.scrollY;
  window.onscroll = function () {
    window.scrollTo(x, y);
  };
}

function enableScrolling() {
  window.onscroll = function () {};
}

const popupLibrary = {
  popUp: null,
  trigger: null,
  popupClose: null,
  isActive: false,

  // инициализация popup
  init(trig) {
    this.popUp = document.querySelector(".popup");
    this.popUpWindow = document.querySelector(".popup__body");
    const that = this;

    this.popUp.addEventListener("click", function (e) {
      that.close(e);
    });
    this.popUpWindow.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    this.popUpClose = document.querySelector(".popup__close");
    this.popUpClose.addEventListener("click", function (e) {
      that.close(e);
    });

    if (trig) {
      this.trigger = trig;
      this.trigger.addEventListener("click", function (e) {
        that.open(e, popupHTML);
      });
    }

    window.addEventListener(
      "keyup",
      function (e) {
        if (e.key === "Escape") {
          that.close();
        }
      },
      true
    );
  },

  // открытие popup
  open(someHTML) {
    if (someHTML) {
      this.popUp.querySelector(".popup__inner").innerHTML = someHTML;
    }
    this.popUp.style.display = "block";
    this.isActive = true;
    this.popUp.querySelector(".popup__inner").scrollTop = 0;
    disableScrolling();
  },

  // закрытие popup
  close() {
    enableScrolling();
    this.popUp.querySelector(".popup__inner").innerHTML = null;
    this.popUp.style.display = "none";
    this.isActive = false;
  },

  // сброс popup
  reset() {
    enableScrolling();
    this.popUp = null;
    this.trigger.removeEventListener("click", this.open);
    this.trigger = null;
  },
};
