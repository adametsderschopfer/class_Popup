;(function (window) {
    class Popup {
        constructor(params) {
            if (params instanceof Object) {
                this.options = Object.assign({}, Popup.defaultParams, params);
            } else {
                throw SyntaxError('Object with parameters not specified')
            }

            this.init(this.options);
        }

        init({content = undefined, ajax}) {
            if (content === undefined) {
                this.$promise = Promise.reject('Content Type Not Supported');
            }

            this.$wrap = Popup.createWrap();
            this.isClosing = false;

            this.addTitle();

            if (content !== null && typeof content === "string") {
                if (content.indexOf("/") >= 0 || ajax === true) {
                    this.$promise = fetch(content).then(
                        (value) => (value.ok ? value.text() : "404 Not found"),
                        (error) => "Check your internet connection"
                    );
                } else {
                    this.$promise = new Promise((resolve, reject) => {
                        let popupElement = document.querySelector(content);

                        if (popupElement instanceof Node) {
                            resolve(popupElement.innerHTML);
                        } else {
                            reject("Selector content not found");
                        }
                    });
                }
            } else if (content instanceof Node) {
                this.$promise = Promise.resolve(content.innerHTML)
            } else {
                this.$promise = Promise.reject('Content Type Not Supported');
            }
        }

        addTitle() {
            let $contentWrap = this.$wrap.querySelector(".popup__content-wrap");

            this.$contentWrap = $contentWrap;

            if (this.options.title === false || !this.options.title) {
                $contentWrap.removeChild($contentWrap.querySelector(".popup__title"));
            } else {
                $contentWrap.querySelector(".popup__title").innerHTML = this.options.title;
            }
        }

        get handlers() {
            return {
                escape: (event) => {
                    if (event.key === 'Escape') {
                        this.close();
                    }
                }
            }
        }

        open() {
            if (this.$promise !== undefined && this.$promise?.then !== undefined) {
                this.$promise.then(
                    (result) => {
                        this.$contentWrap.insertAdjacentHTML("beforeend", result);

                        document.body.appendChild(this.$wrap);

                        if (typeof this.options.onAfterAppend === "function") {
                            this.options.onAfterAppend(this.$wrap);
                        }
                    },
                    (error) => {
                        this.$contentWrap.insertAdjacentHTML("afterbegin", "Something went wrong");
                        console.log(error);
                    }
                );
            }

            if (this.options.cache) {
                this.$promise = undefined;
            }

            !this.isClosing && this.$wrap.classList.add("popup_open");

            if (window['getScrollBarWidth']) {
                Popup.setPadding(getScrollBarWidth() + "px", this.options.paddingRightElements);
            }

            document.addEventListener("keydown", this.handlers.escape);

            if (typeof this.options.onAfterOpen === "function") {
                this.options.onAfterOpen(this.$wrap);
            }
        }

        close() {
            this.isClosing = true;

            this.$wrap.classList.remove("popup_open");
            this.$wrap.classList.add("popup_hide");

            setTimeout(() => {
                this.$wrap.classList.remove("popup_hide");
                Popup.setPadding(0, this.options.paddingRightElements);
                document.removeEventListener("keydown", this.handlers.escape);
                this.isClosing = false;

            }, Popup.config.ANIMATION_SPEED);

            if (typeof this.options.onAfterClose === "function") {
                this.options.onAfterClose(wrap);
            }
        }

        static createWrap() {
            let wrap = document.createElement("div");
            wrap.dataset.close = "true";
            wrap.classList.add("popup");

            wrap.innerHTML = `
                <div class="popup__wrap">
                    <svg class="popup__logo-fixed" width="64" height="16" viewBox="0 0 128 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="#FF005C"><path fill-rule="evenodd" clip-rule="evenodd" d="M119 18h-13v10h13a5 5 0 000-10zm-17-4v18h17a9 9 0 009-9 9 9 0 00-9-9h-17z"/><path d="M126 0h-24v32h4V4h20V0z"/></g><g fill="#FF005C"><path d="M94 0v32h-4V18H70v14h-4V0h4v14h20V0h4z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M44 28c6.627 0 12-5.373 12-12S50.627 4 44 4 32 9.373 32 16s5.373 12 12 12zm0 4c8.837 0 16-7.163 16-16S52.837 0 44 0 28 7.163 28 16s7.163 16 16 16z"/><path d="M22 0L8 14H4V0H0v32h4V18h4l14 14 2.82-2.82L11.64 16 24.82 2.82 22 0z"/></g></svg>
                      <div class="popup__close" data-close="true"><span class="popup__close_1"></span><span class="popup__close_2"></span></div>
                    <div class="popup__content-wrap"><h3 class="popup__title"></h3></div>
                </div>
                `;

            return wrap;
        }

        static setPadding(padding, paddingRightElements) {
            window.document.body.style.overflowY = padding ? "hidden" : "scroll";
            window.document.body.style.paddingRight = padding;

            if (!(paddingRightElements instanceof Array) || !paddingRightElements.length) {
                return;
            }

            for (let i in paddingRightElements) {
                let selector = paddingRightElements[i],
                    nodeList = document.querySelectorAll(selector);

                if (!nodeList.length) {
                    continue;
                }

                for (let j in nodeList) {
                    let currentElement = nodeList[j];
                    if (!(currentElement instanceof Node)) {
                        continue;
                    }

                    currentElement.style.paddingRight = padding;
                }
            }
        }

        static defaultParams = {
            cache: true,
            display: "block",
            data: {},
            paddingRightElements: [],
            title: "Окно",
            onAfterAppend: null,
            onAfterOpen: null,
            onAfterClose: null,
        };

        static config = {
            ANIMATION_SPEED: 200
        }
    }

    window.legacyPopup = (params = {}) => new Popup(params);
})(window);
