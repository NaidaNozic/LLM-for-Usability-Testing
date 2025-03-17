app_overview = """The web application is an online hub for students and tutors to exchange materials and information related 
to lectures of a particular course."""

user_task = """View all available courses in the system."""

source_code = """{% extends 'courses/dashboard.html' %}

{% block content_courses %}
{% load static %}

<div style="margin-left: auto; margin-right: auto; width:75%; margin-top: 5%; position: relative;">
  <img class="col-sm-4 col-md-4 col-lg-4" src="{% static 'img/course.png' %}"
       style="width:7%;">

  <div class="col-sm-8 col-md-8 col-lg-8 availableCourses">
    <h5 class="title">AVAILABLE COURSES</h5>
  </div>
</div>

<hr style="width: 80%; margin-left: auto; margin-right: auto; background-color: black;
           opacity: 1; margin-top: 0; height: 2px;">

    <div class="container coursesBox">

        <div class="row centerCourses equal">

        
        {% if all_courses %}
        {% for course in all_courses %}

        <div class="cols-sm-6 col-md-4 col-lg-3" style="margin-bottom: 2%;">

          <div class="card" style="max-width: 300px; min-width: 100px; border-radius: 0px; height: 100%;">
            <img class="card-img-top" src="{{ course.image.url }}" alt="Card image" style="width: 100%;padding: 10px;">
            <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div style="margin-bottom: 3%;">
                <h4 class="card-title">{{course.name}}</h4>
                <p class="card-text">{{course.summary}}</p>
              </div>
              <div>
                {% if user.is_student %}
                  <a href="{% url 'course' course_id=course.pk %}" class="btn btn-primary">View</a>
                {% else %}
                  <a href="{% url 'tutor_course' course_id=course.pk %}" class="btn btn-primary">View</a>
                {% endif%}
              </div>
            </div>
          </div>

        </div>

        {% endfor %}
        {% else %}
        <h2 style="text-align: center;">There are no courses yet!</h2>
        {% endif %} 

    </div>
</div>

{% endblock %}"""

nielsen_principles = """ NS01—Visibility of system status: the design principle that states systems should
 always keep users informed about what is going on, through appropriate feedback within
 a reasonable time. Nielsen asserts that users should never be in doubt about the system’s
current state or whether their actions have been successful. Especially when the execution
 time in the case exceeds 3000 milliseconds, a system must prompt the current system status.

 NS02—User control and freedom: User Control and Freedom refers to Nielsen’s principle that users often perform 
 actions by mistake. They need a clearly marked “emergency exit” to leave the unwanted state without having to go through 
 an extended process. This includes all relevant buttons for undo and redo actions, providing the freedom and control
 to manage their interaction with the system. For example, cancel button, return button, etc.

 NS03—Helps users recognize, diagnose, and recover from errors: Help Users Recog
nise, Diagnose, and Recover from Errors is a principle that emphasizes error messages
 should be expressed in plain language (no codes), precisely indicate the problem, and con
structively suggest a solution. Nielsen stresses the importance of designing systems that
 make it clear when an error has occurred and help users understand what has gone wrong
 and howthey can fix it without additional frustration. For instance, during account reg
istration, if the password format does not meet the required criteria, the system should
 provide a prompt specifying the particular password policy that has been violated.

 NS04—Consistency and standards: Consistency and Standards refer to the principle
 that user interfaces should be consistent throughout a single application and also match
 with platform conventions and user expectations. Essentially, interfaces should follow
 consistent rules, and users should not have to wonder whether different words, situations,
 or actions mean the same thing. Jakob Nielsen emphasizes that consistency allows users
 to transfer knowledge and skills from one part of an application to another, and from one
 application to another, reducing the learning curve. For example, the return button should
 be to the left of the Confirm button and the Confirm button should be more conspicuous.

 NS05—Recognition rather than recall: Recognition Rather Than Recall is the principle that systems should minimize 
 the user’s memory load by making objects, options, and actions visible or easily retrievable. Nielsen advocates for 
 interfaces to reduce user’s cognitive load by making elements recognizable rather than expecting users to remember
 information from one part of an interface to another. For example, history records and
 course search functions.

 NS06—Match Between System and The Real World: This principle suggests that a
 system should speak the users’ language, with words, phrases, and concepts familiar to the
 user, rather than system-oriented terms. It should follow real-world conventions, making
 information appear in a natural and logical order. The idea is to leverage users’ existing
 knowledge of the world to make systems understandable and intuitive. For example,
 information can be presented in a table, or a trash bin icon is instantly recognizable as a
 place to discard files because it mirrors the physical object we’re all familiar with.
 
 NS07—Error Prevention: Errors and mistakes should be avoided with safeguards built into the design. 
 For example, this might mean asking users for confirmation before executing an irreversible action, 
 such as deleting an account or completing a purchase.
 
 NS08—Flexibility and Efficiency of Use: Designs should cater to both novice and expert users. 
 Ideally, experienced users should be able to leverage shortcuts and customize the interface to make repetitive processes 
 more efficient.
 
 NS09—Aesthetic and Minimalist Design: The Aesthetic and Minimalist Design principle refers to the principle
 that user interfaces should eliminate unnecessary information that can distract users from the 
 information they need. Designers can do this by adopting a minimal approach to design and establishing a clear hierarchy 
 of information on the page, which keeps users focused on essential elements that are key to usability, like buttons and links.
 
 NS10—Help and Documentation: The Help and Documentation principle referes to the fact that ideally, systems should be designed 
 to be as self-explanatory as possible. However, it’s often necessary to provide additional documentation to help users who require guidance or 
 run into problems, especially with more complex software programs."""