/* =========================================
   FIXMATE CUSTOMER SUPPORT
   FAQ Accordion
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const faqItems =
        document.querySelectorAll(".faq-item");


    faqItems.forEach(function (item) {

        const question =
            item.querySelector(".faq-question");

        const answer =
            item.querySelector(".faq-answer");


        question.addEventListener("click", function () {

            const isActive =
                item.classList.contains("active");


            /*
             * Close all other FAQ items
             */

            faqItems.forEach(function (otherItem) {

                if (otherItem !== item) {

                    otherItem.classList.remove("active");

                    const otherAnswer =
                        otherItem.querySelector(".faq-answer");

                    otherAnswer.style.maxHeight = null;
                }

            });


            /*
             * Toggle selected FAQ
             */

            if (!isActive) {

                item.classList.add("active");

                answer.style.maxHeight =
                    answer.scrollHeight + "px";

            } else {

                item.classList.remove("active");

                answer.style.maxHeight = null;
            }

        });

    });

});