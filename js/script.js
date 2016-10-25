var Todo = {
    // ----------------------------------------
    // Initialize
    // ----------------------------------------
    init: function() {
        this.checkDB();
        this.cacheDom();
        this.bindEvents();
        this.renderTasks();
        this.initDatesInForm();
        this.makeTasksDraggable();
    },

    // ----------------------------------------
    // Check the localStorage Database
    // ----------------------------------------
    checkDB: function() {
        var result = localStorage.getItem('todoList');

        if( result === null  ) {
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
            'priority': this.$formPrio.children('.active').find('input').data("prio"),
            'id': this.tasks.length + 1,
            'isDone': false
        };

        return formValues;
    },

    // ----------------------------------------
    // Event binding
    // ----------------------------------------
    bindEvents: function() {

        this.$formAddButton.on( 'click', this.addTask );
        $(document).on('click', '#' + this.$editBtn.attr('id'), this.toggleEditMode);
        $(document).on('click', '.edit-btns button', this.doActionWithItem);

        // Log the tasks to the console when pressing Escape
        $(document).on('keydown', function(e) {
            if (e.keyCode === 27) {
                console.log('Array:');
                console.log( Todo.tasks );

                // console.log('localStorage:');
                // console.log( localStorage.getItem('todoList') );
            }
        });

        // Clear localStorage
        $('.clearLS').on('click', function() {
            localStorage.clear();
            console.log('localStorage cleared');
            Todo.tasks = [];
        });
    },

    // ----------------------------------------
    // Toggle edit mode
    // ----------------------------------------
    toggleEditMode: function() {
        var self = Todo;
        // Cache the dom again so we know what $('.edit-btns') is...
        // Maybe not the ideal way to go but hey... I'm just a student.
        self.cacheDom();
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
        this.tasks.push(task);
        this.updateDB();
    },

    // ----------------------------------------
    // Add to the localStorage DB
    // ----------------------------------------
    updateDB: function(skipRender) {
        localStorage.setItem( 'todoList', JSON.stringify(this.tasks) );
        if(!skipRender) {
            this.renderTasks();
        }
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
            errorMessage = "The date has to be in format YYYY-MM-DD";
            this.$formTodaysDate.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');

        } else {
            this.$formTodaysDate
                .parent().removeClass('has-error').find('.help-block').remove();
        }

        if( !task.dueDate.match(dueDateMatch) ) {
            passedValidation = false;
            errorMessage = "The date has to be in format YYYY-MM-DD";
            this.$formDueDate.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formDueDate.parent()
                .removeClass('has-error').find('.help-block').remove();
        }

        if( !task.heading.match(headingMatch) ) {
            passedValidation = false;
            errorMessage = "The heading has to be 1-50 characters";
            this.$formHeading.parent().addClass('has-error')
                .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formHeading.parent()
                .removeClass('has-error').find('.help-block').remove();
        }

        if( task.desc.length <= 0 || task.desc.length > 200) {
            passedValidation = false;
            errorMessage = "The description has to be 1-200 characters";
            this.$formDesc.parent().addClass('has-error')
            .prepend('<span class="help-block">'+ errorMessage +'</span>');
        } else {
            this.$formDesc
                .parent().removeClass('has-error').find('.help-block').remove();
        }

        return passedValidation;
    },

    // ----------------------------------------
    // Build the markup for the tasks
    // ----------------------------------------
    renderTasks: function() {
        // Empty the UL
        this.$tasksUL.html('');

        // Set a header if the list is empty
        if (this.tasks.length === 0) {
            this.$tasksUL.html('<h2>You have no tasks!</h2>');
            this.$editBtn.hide();
        } else { this.$editBtn.show(); }

        for (var i = 0; i < this.tasks.length; i++) {
            var html = "", prio, isDone;
            // Set prio from int to !, !! or !!!
            if(this.tasks[i].priority === 1) { prio = "!"; }
            else if(this.tasks[i].priority === 2) { prio = "!!"; }
            else if(this.tasks[i].priority === 3) { prio = "!!!"; }

            if(this.tasks[i].isDone) { isDone = " item-done"; } // This string will be added to the class
            else { isDone = ""; }

            // Build all the markup (yes, this is ugly, I know!)

            html += '<li data-task-id="'+ this.tasks[i].id +'" class="task list-group-item'+ isDone +'">';
                html+='<span class="date"><span class="glyphicon glyphicon-calendar"></span> '+ this.tasks[i].todaysDate +'</span>';
                html+='<h4><span class="prio">'+ prio +'</span> '+ this.tasks[i].heading +'</h4>';
                html+='<p class="desc">'+ this.tasks[i].desc +'</p>';
                html+='<span class="due"><span class="glyphicon glyphicon-time"></span> '+ this.tasks[i].dueDate +'</span>';

                html+='<span class="move-icon glyphicon glyphicon-menu-hamburger"></span>';

                html+='<div class="btn-group btn-group-lg edit-btns">';
                    html+='<button type="button" data-action="doneAction" class="btn btn-default">';
                        html+='<span class="glyphicon glyphicon-check text-success"></span>';
                    html+='</button>';

                    html+='<button type="button" data-action="editAction" class="btn btn-default">';
                        html+='<span class="glyphicon glyphicon-edit text-warning"></span>';
                    html+='</button>';

                    html+='<button type="button" data-action="deleteAction" class="btn btn-default">';
                        html+='<span class="glyphicon glyphicon-remove-circle text-danger"></span>';
                    html+='</button>';
                html+='</div>';
            html+='</li>';

            // Append the markup to the UL
            this.$tasksUL.append(html);
        }

    },

    // ----------------------------------------
    // Action button clicked (check, edit, delete)
    // ----------------------------------------
    doActionWithItem: function() {
        // this = the button that was clicked
        var self = Todo;
        var $this = $(this),
            id = $this.parent().parent().data('task-id'),
            action = $this.data('action');

        if(action === 'doneAction') { self.toggleMarkDone(id); }
        else if(action === 'editAction') { self.editTask(id); }
        else if(action === 'deleteAction') { self.deleteTask(id); }
    },

    // ----------------------------------------
    // Mark task done
    // ----------------------------------------
    toggleMarkDone: function(id) {
        for (var i = 0; i < this.tasks.length; i++) {
            // this.tasks[i]
            if (this.tasks[i].id === id) {
                var $itemToMarkDone = $( '[data-task-id='+ id +']' );

                if ( $itemToMarkDone.hasClass('item-done') ) {
                    this.tasks[i].isDone = false;
                    $itemToMarkDone.removeClass('item-done');
                }
                else {
                    this.tasks[i].isDone = true;
                    $itemToMarkDone.addClass('item-done');
                }

                break;
            }
        }
        this.toggleEditMode();
        this.updateDB(true);
    },

    // ----------------------------------------
    // Delete task
    // ----------------------------------------
    deleteTask: function(id) {
        var itemToRemove,
            self = this;

        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === id) {
                var $itemToRemove = $( '[data-task-id='+ id +']' );

                itemToRemove = i;
                // console.log(itemToRemove);
                break;
            }
        }

        this.tasks.splice(itemToRemove, 1);
        this.toggleEditMode();

        $itemToRemove.slideUp(function() {
            self.updateDB();
            $(this).remove();
        });
    },

    // ----------------------------------------
    // Edit task
    // ----------------------------------------
    editTask: function(id) {

        for (var i = 0; i < this.tasks.length; i++) {

        }
    }
};



$(document).ready(function() {
    Todo.init();
});
