class UniqueInput < SimpleForm::Inputs::TextInput
  def input wrapper_options
    @wrapper_options = wrapper_options
    out = ActiveSupport::SafeBuffer.new
    out << @builder.text_field(attribute_name, input_field_options)
    out << content_tag(:span, '', id: message_element_id, class: 'message')
  end

  private

  def input_field_options
    result = input_html_options || {}
    result[:class] = "#{input_html_options_class} #{wrapper_class} simple_form_unique"
    result[:placeholder] = placeholder_text
    result[:'data-message-field'] = "##{message_element_id}"
    result[:'data-source'] = input_html_options[:source]
    result[:'data-original-value'] = object.try(attribute_name)
    result
  end

  def input_html_options_class
    @input_html_classes.join ' '
  end

  def wrapper_class
    html_classes = (@wrapper_options[:class] || @wrapper_options['class'])
    if html_classes.is_a? Array
      html_classes.join! ' '
    elsif html_classes.nil?
      html_classes = ''
    end
    html_classes
  end

  def message_element_id
    "unique_message_for_#{attribute_name}"
  end
end
