var Todo = {
    // ----------------------------------------
    // Global variables (including dumb tasks)
    // ----------------------------------------
    dumbTasks: [{
            'todaysDate': '2016-10-20',
            'dueDate': '2016-10-22',
            'heading': 'Tvätta (Task 1)',
            'task': 'Tvätta allt vitt ikväll!',
            'priority': 1
        },
        {
            'todaysDate': '2016-10-20',
            'dueDate': '2016-10-22',
            'heading': 'Skura (Task 2)',
            'task': 'Skura badrummet!',
            'priority': 3
        },
        {
            'todaysDate': '2016-10-20',
            'dueDate': '2016-10-22',
            'heading': 'Hämta på dagis (Task 2)',
            'task': 'Hämta lillen på dagis kl 16',
            'priority': 3
        }
    ],

    // ----------------------------------------
    // Initialize
    // ----------------------------------------
    init: function() {
        this.checkDB();
        this.cacheDom();
        this.bindEvents();
        this.initDatesInForm();
        this.makeTasksDraggable();
    },

    // ----------------------------------------
    // Check the localStorage Database
    // ----------------------------------------
    checkDB: function() {
        var result = localStorage.getItem('todoList');

        if( result == null  ) {
            this.tasks = [];
        }
        else {
            this.tasks = JSON.parse( result );
        }
    },

    // ----------------------------------------
    // Fill today's date in that field.
    // ----------------------------------------
    initDatesInForm: function() {
        // Set today's date and disable the input
        this.$formTodaysDate
            .val( $.datepicker.formatDate("yy-mm-dd", new Date()) )
            .attr('disabled', 'true');

        // Init the datepicker on the due input
        this.$formDueDate.datepicker({
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            minDate: -1 //Set yesterday as minimum date, for testing past dates
        });
    },

    // ----------------------------------------
    // Make todo items draggable with jQuery UI
    // ----------------------------------------
    makeTasksDraggable: function() {
        this.$tasksUL.sortable({
            'axis': 'y',
            'handle': '.move-icon',
            'classes': {
                'ui-sortable-helper': 'moving-task'
            }

        });
    },

    // ----------------------------------------
    // Cache DOM
    // ----------------------------------------
    cacheDom: function() {
        this.$form = $('#add-form');
        this.$formAddButton = $('#add-button');
        this.$formTodaysDate = $('#date');
        this.$formDueDate = $('#due');
        this.$formHeading = $('#heading');
        this.$formDesc = $('#desc');
        this.$formPrio = $('#prio');

        this.$tasksUL = $('#tasks');
        this.$editBtn = $('#edit-btn');
        this.$editBtns = $('.edit-btns');
    },

    // ----------------------------------------
    // Get form values
    // ----------------------------------------
    getFormValues: function() {
        var formValues = {
            'todaysDate': this.$formTodaysDate.val(),
            'dueDate': this.$formDueDate.val(),
            'heading': this.$formHeading.val(),
            'desc': this.$formDesc.val(),
            'priority': this.$formPrio.children('.active').find('input').data("prio")
        }

        return formValues;
    },

    // ----------------------------------------
    // Event binding
    // ----------------------------------------
    bindEvents: function() {
        this.$formAddButton.on( 'click', this.addTask );
        this.$editBtn.on( 'click', this.toggleEditMode );

        // Log the tasks to the console when pressing Escape
        $(document).on('keydown', function(e) { e.keyCode === 27 && console.log( Todo.tasks ); });
    },

    // ----------------------------------------
    // Toggle edit mode
    // ----------------------------------------
    toggleEditMode: function() {
        var self = Todo;
        self.$editBtns.toggleClass('edit-mode');
    },

    // ----------------------------------------
    // Add tasks
    // ----------------------------------------
    addTask: function(e) {
        e.preventDefault();

        var self = Todo;

        if( self.validateForm() ) {
            self.pushToArray();
        }
    },

    // ----------------------------------------
    // Add to the tasks array
    // ----------------------------------------
    pushToArray: function() {
        var task = this.getFormValues();
        console.log(task);
        this.tasks.push(task);
        // this.updateDB();
    },

    // ----------------------------------------
    // Add to the localStorage DB
    // ----------------------------------------
    updateDB: function() {
        localStorage.setItem( 'todoList', JSON.stringify(this.tasks) );
    },

    // ----------------------------------------
    // Validate Form
    // ----------------------------------------
    validateForm: function() {
        var task = this.getFormValues(),
            todaysDateMatch = /[0-9]{4}\-[0-9]{2}\-[0-9]{2}/,
            dueDateMatch = /[0-9]{4}\-[0-9]{2}\-[0-9]{2}/,
            headingMatch = /.{1,50}/,
            errorMessage,
            passedValidation = true;

        if( !task.todaysDate.match(todaysDateMatch) ) {
            passedValidation = false;
            var errorMessage = "The date has to be in format YYYY-MM-DD";
            this.$formTodaysDate.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');

        } else {
            this.$formTodaysDate
                .parent().removeClass('has-error').find('.help-block').remove();
        }

        if( !task.dueDate.match(dueDateMatch) ) {
            passedValidation = false;
            var errorMessage = "The date has to be in format YYYY-MM-DD";
            this.$formDueDate.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formDueDate.parent()
                .removeClass('has-error').find('.help-block').remove();
        }

        if( !task.heading.match(headingMatch) ) {
            passedValidation = false;
            var errorMessage = "The heading has to be 1-50 characters";
            this.$formHeading.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formHeading.parent()
                .removeClass('has-error').find('.help-block').remove();
        }

        if( task.desc.length <= 0 || task.desc.length > 200) {
            passedValidation = false;
            var errorMessage = "The description has to be 1-200 characters";
            this.$formDesc.parent().addClass('has-error')
            .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formDesc
                .parent().removeClass('has-error').find('.help-block').remove();
        }

        return passedValidation;
    }
};



$(document).ready(function() {
    Todo.init();
});
