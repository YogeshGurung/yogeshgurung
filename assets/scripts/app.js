"use strict";

const Timer = () => {
    let resetFns = [];

    function timeout(callback, time) {
        const idx = setTimeout(callback, time);
        const reset = () => clearTimeout(idx);

        resetFns.push(reset);

        return () => {
            resetFns = resetFns.filter(fn => fn !== reset);
            reset();
        };
    }

    function interval(callback, time) {
        const idx = setInterval(callback, time);
        const reset = () => clearInterval(idx);

        resetFns.push(reset);

        return () => {
            resetFns = resetFns.filter(fn => fn !== reset);
            reset();
        };
    }

    function clearAll() {
        resetFns.forEach(fn => fn());
        resetFns = [];
    }

    return {
        timeout,
        interval,
        clearAll,
    };
};

class Carousel {
    static DIRECTION = Object.freeze({
        FORWARD: 1,
        BACKWARD: -1,
    });

    constructor({ el, next, prev, wait, duration}) {
        this.$el = el;
        this.timer = Timer();
        this.waiting = true;


        this.index = {
            current: 0,
            get prev() {
                return this.current - 1 < 0 ? el.children().length - 1 : this.current - 1;
            },
            get next() {
                return this.current + 1 < el.children().length ? this.current + 1 : 0;
            }
        }

        this.config = {
            currentDirection: Carousel.DIRECTION.FORWARD,
            animationWait: wait ? wait : 5E3,
        };


        next.click(() => this.forward());
        prev.click(() => this.backward());

        $(document).keyup(({ originalEvent: { key }}) => {
            switch (key) {
                case "ArrowLeft":
                    this.backward();
                    break;
                case "ArrowRight":
                    this.forward();
                    break;
                default:
                    break;
            }
        });
    }

    forward() {
        this.timer.clearAll();
        this.waiting = false;
        this.config.currentDirection = Carousel.DIRECTION.FORWARD;

        this.animate(this.run.bind(this));

        return this;
    }

    backward() {
        this.timer.clearAll();
        this.waiting = false;
        this.config.currentDirection = Carousel.DIRECTION.BACKWARD;

        this.animate(this.run.bind(this));

        return this;
    }

    animate(callback) {
        this.index.current = this.config.currentDirection === Carousel.DIRECTION.FORWARD
            ? this.index.next
            : this.index.prev;

        this.config.currentDirection = Carousel.DIRECTION.FORWARD;

        this.$el.children().css({ right: `${this.index.current * 100}%`});

        if(typeof callback === "function") callback();
    }

    run() {
        this.timer.interval(this.animate.bind(this), this.config.animationWait);

        return this;
    }
}

$(".more svg").click(() => {
    $(".content").toggleClass("content--open");
});